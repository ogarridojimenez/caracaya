export interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number;
  disabled?: boolean;
  preview?: boolean;
  label?: string;
  error?: string;
  className?: string;
  dropzoneClassName?: string;
}

export interface FileWithPreview extends File {
  preview?: string;
}

export interface UseFileUploadReturn {
  getRootProps: () => Record<string, unknown>;
  getInputProps: () => Record<string, unknown>;
  isDragActive: boolean;
  previews: FileWithPreview[];
  removeFile: (index: number) => void;
  clearFiles: () => void;
  open: () => void;
}
