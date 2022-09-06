import {
  ChangeEvent,
  DragEvent as ReactDragEvent,
  MouseEvent as ReactMouseEvent,
  useState,
} from "react";
import {
  FormGroup,
  FileUpload,
  Modal,
  ModalVariant,
  Button,
  FileUploadProps,
} from "@patternfly/react-core";
import { useTranslation } from "react-i18next";
import { CodeEditor, Language } from "@patternfly/react-code-editor";

type FileUploadType = {
  value: string;
  filename: string;
  isLoading: boolean;
  modal: boolean;
};

export type FileUploadEvent =
  | ReactDragEvent<HTMLElement> // User dragged/dropped a file
  | ChangeEvent<HTMLTextAreaElement> // User typed in the TextArea
  | ReactMouseEvent<HTMLButtonElement, MouseEvent>; // User clicked Clear button

export type FileUploadFormProps = Omit<FileUploadProps, "onChange"> & {
  id: string;
  extension: string;
  onChange: (value: string) => void;
  helpText?: string;
  unWrap?: boolean;
  language?: Language;
};

export const FileUploadForm = ({
  id,
  onChange,
  helpText = "common-help:helpFileUpload",
  unWrap = false,
  language,
  extension,
  ...rest
}: FileUploadFormProps) => {
  const { t } = useTranslation();
  const defaultUpload: FileUploadType = {
    value: "",
    filename: "",
    isLoading: false,
    modal: false,
  };
  const [fileUpload, setFileUpload] = useState<FileUploadType>(defaultUpload);
  const removeDialog = () => setFileUpload({ ...fileUpload, modal: false });
  const handleChange: FileUploadProps["onChange"] = (
    value,
    filename,
    event
  ) => {
    if (
      event.nativeEvent instanceof MouseEvent &&
      !(event.nativeEvent instanceof DragEvent)
    ) {
      setFileUpload({ ...fileUpload, modal: true });
    } else {
      setFileUpload({
        ...fileUpload,
        value: value.toString(),
        filename,
      });

      if (value) {
        onChange(value.toString());
      }
    }
  };

  return (
    <>
      {fileUpload.modal && (
        <Modal
          variant={ModalVariant.small}
          title={t("clearFile")}
          isOpen
          onClose={removeDialog}
          actions={[
            <Button
              key="confirm"
              variant="primary"
              data-testid="clear-button"
              onClick={() => {
                setFileUpload(defaultUpload);
                onChange("");
              }}
            >
              {t("clear")}
            </Button>,
            <Button
              data-testid="cancel"
              key="cancel"
              variant="link"
              onClick={removeDialog}
            >
              {t("cancel")}
            </Button>,
          ]}
        >
          {t("clearFileExplain")}
        </Modal>
      )}
      {unWrap && (
        <FileUpload
          id={id}
          {...rest}
          type="text"
          value={fileUpload.value}
          filename={fileUpload.filename}
          onChange={handleChange}
          onReadStarted={() =>
            setFileUpload({ ...fileUpload, isLoading: true })
          }
          onReadFinished={() =>
            setFileUpload({ ...fileUpload, isLoading: false })
          }
          isLoading={fileUpload.isLoading}
          dropzoneProps={{
            accept: extension,
          }}
        />
      )}
      {!unWrap && (
        <FormGroup
          label={t("resourceFile")}
          fieldId={id}
          helperText={t(helpText)}
        >
          <FileUpload
            id={id}
            {...rest}
            type="text"
            value={fileUpload.value}
            filename={fileUpload.filename}
            onChange={handleChange}
            onReadStarted={() =>
              setFileUpload({ ...fileUpload, isLoading: true })
            }
            onReadFinished={() =>
              setFileUpload({ ...fileUpload, isLoading: false })
            }
            isLoading={fileUpload.isLoading}
            hideDefaultPreview
          >
            {!rest.hideDefaultPreview && (
              <CodeEditor
                isLineNumbersVisible
                code={fileUpload.value}
                language={language}
                height="128px"
                onChange={(value, event) =>
                  handleChange(value || "", fileUpload.filename, event as any)
                }
                isReadOnly={!rest.allowEditingUploadedText}
              />
            )}
          </FileUpload>
        </FormGroup>
      )}
    </>
  );
};
