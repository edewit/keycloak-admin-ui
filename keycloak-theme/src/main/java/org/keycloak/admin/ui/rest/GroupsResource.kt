package org.keycloak.admin.ui.rest

import org.eclipse.microprofile.openapi.annotations.Operation
import org.eclipse.microprofile.openapi.annotations.enums.SchemaType
import org.eclipse.microprofile.openapi.annotations.media.Content
import org.eclipse.microprofile.openapi.annotations.media.Schema
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse
import org.keycloak.models.GroupModel
import org.keycloak.models.KeycloakSession
import org.keycloak.models.RealmModel
import org.keycloak.models.utils.ModelToRepresentation
import org.keycloak.models.utils.ModelToRepresentation.toRepresentation
import org.keycloak.representations.idm.GroupRepresentation
import org.keycloak.services.resources.admin.permissions.AdminPermissionEvaluator
import org.keycloak.utils.StringUtil
import java.util.stream.Collectors
import java.util.stream.Stream
import javax.ws.rs.*
import javax.ws.rs.core.Context
import javax.ws.rs.core.MediaType

@Path("/")
open class GroupsResource(
    private var realm: RealmModel,
    private var auth: AdminPermissionEvaluator,
) {
    @Context
    var session: KeycloakSession? = null

    @GET
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(
        summary = "List all groups with fine grained authorisation",
        description = "This endpoint returns a list of groups with fine grained authorisation"
    )
    @APIResponse(
        responseCode = "200", description = "", content = [Content(
            schema = Schema(
                type = SchemaType.ARRAY, implementation = GroupRepresentation::class
            )
        )]
    )
    fun listGroups(
        @QueryParam("search") @DefaultValue("") search: String,
        @QueryParam("first") @DefaultValue("0") first: Int,
        @QueryParam("max") @DefaultValue("10") max: Int
    ): Stream<GroupRepresentation>? {
        auth.groups().requireList();

        val stream = if (search.isNotBlank()) {
            realm.searchForGroupByNameStream(search.trim(), first, max)
        } else {
            realm.getTopLevelGroupsStream(first, max)
        }

        return stream.map { g ->
            toGroupHierarchy(g, search)
        }
    }

    private fun toGroupHierarchy(group: GroupModel, search: String): GroupRepresentation {
        val rep: GroupRepresentation = toRepresentation(group, true)
        rep.access = auth.groups().getAccess(group)
        rep.subGroups = group.subGroupsStream.filter { g: GroupModel ->
            groupMatchesSearchOrIsPathElement(
                g, search
            )
        }.map { subGroup: GroupModel? ->
            ModelToRepresentation.toGroupHierarchy(
                subGroup, true, search
            )
        }.collect(Collectors.toList())

        return rep
    }

    private fun groupMatchesSearchOrIsPathElement(group: GroupModel, search: String?): Boolean {
        return if (StringUtil.isBlank(search)) {
            true
        } else {
            if (group.name.contains(search!!)) true else group.subGroupsStream.findAny().isPresent
        }
    }
}