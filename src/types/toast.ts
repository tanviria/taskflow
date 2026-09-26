export interface ToastMessage {
  id: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
  duration?: number;
}
