package org.keycloak.admin.ui.rest;

import static org.keycloak.models.utils.ModelToRepresentation.toRepresentation;

import java.util.stream.Collectors;
import java.util.stream.Stream;
import javax.ws.rs.Consumes;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.GET;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.enums.SchemaType;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.keycloak.models.GroupModel;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.RealmModel;
import org.keycloak.models.utils.ModelToRepresentation;
import org.keycloak.representations.idm.GroupRepresentation;
import org.keycloak.services.resources.admin.permissions.AdminPermissionEvaluator;
import org.keycloak.utils.StringUtil;

public class GroupsResource {
    @Context
    private KeycloakSession session;
    private RealmModel realm;
    private AdminPermissionEvaluator auth;

    public GroupsResource(RealmModel realm, AdminPermissionEvaluator auth) {
        super();
        this.realm = realm;
        this.auth = auth;
    }

    @GET
    @Consumes({"application/json"})
    @Produces({"application/json"})
    @Operation(
            summary = "List all groups with fine grained authorisation",
            description = "This endpoint returns a list of groups with fine grained authorisation"
    )
    @APIResponse(
            responseCode = "200",
            description = "",
            content = {@Content(
                    schema = @Schema(
                            implementation = GroupRepresentation.class,
                            type = SchemaType.ARRAY
                    )
            )}
    )
    public final Stream<GroupRepresentation> listGroups(@QueryParam("search") @DefaultValue("") final String search, @QueryParam("first")
        @DefaultValue("0") int first, @QueryParam("max") @DefaultValue("10") int max, @QueryParam("global") @DefaultValue("true") boolean global) {
        this.auth.groups().requireList();
        final Stream<GroupModel> stream;
        if (!"".equals(search)) {
            if (global) {
                stream = this.realm.searchForGroupByNameStream(search, first, max);
            } else {
                stream = this.realm.getTopLevelGroupsStream().filter(g -> g.getName().contains(search)).skip(first).limit(max);
            }
        } else {
            stream = this.realm.getTopLevelGroupsStream(first, max);
        }
        return stream.map(g -> toGroupHierarchy(g, search));
    }

    private GroupRepresentation toGroupHierarchy(GroupModel group, final String search) {
        GroupRepresentation rep = toRepresentation(group, true);
        rep.setAccess(auth.groups().getAccess(group));
        rep.setSubGroups(group.getSubGroupsStream().filter(g ->
                groupMatchesSearchOrIsPathElement(
                        g, search
                )
        ).map(subGroup ->
            ModelToRepresentation.toGroupHierarchy(
                    subGroup, true, search
            )
        ).collect(Collectors.toList()));

        return rep;
    }

    private static boolean groupMatchesSearchOrIsPathElement(GroupModel group, String search) {
        if (StringUtil.isBlank(search)) {
            return true;
        }
        if (group.getName().contains(search)) {
            return true;
        }
        return group.getSubGroupsStream().findAny().isPresent();
    }
}
