import SweetAlert2 from 'sweetalert2';

export type ConfirmType = 'danger' | 'warning' | 'info' | 'success';

export interface ConfirmOptions {
  title: string;
  text?: string;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmType;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  showCancel?: boolean;
}

interface SweetAlertStyle {
  icon: 'success' | 'error' | 'warning' | 'info' | 'question';
  confirmButtonColor: string;
  cancelButtonColor: string;
}

const typeStyles: Record<ConfirmType, SweetAlertStyle> = {
  danger: {
    icon: 'warning',
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280',
  },
  warning: {
    icon: 'warning',
    confirmButtonColor: '#f59e0b',
    cancelButtonColor: '#6b7280',
  },
  info: {
    icon: 'info',
    confirmButtonColor: '#3b82f6',
    cancelButtonColor: '#6b7280',
  },
  success: {
    icon: 'success',
    confirmButtonColor: '#22c55e',
    cancelButtonColor: '#6b7280',
  },
};

export const confirmService = {
  open: (options: ConfirmOptions): void => {
    const { type = 'danger', showCancel = true, ...rest } = options;

    SweetAlert2.fire({
      title: rest.title,
      text: rest.text,
      icon: typeStyles[type].icon,
      showCancelButton: showCancel,
      confirmButtonText: rest.confirmText ?? 'Confirmar',
      cancelButtonText: rest.cancelText ?? 'Cancelar',
      confirmButtonColor: typeStyles[type].confirmButtonColor,
      cancelButtonColor: typeStyles[type].cancelButtonColor,
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        rest.onConfirm();
      } else if (result.isDismissed && rest.onCancel) {
        rest.onCancel();
      }
    });
  },

  delete: (onConfirm: () => void | Promise<void>): void => {
    confirmService.open({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer.',
      type: 'danger',
      confirmText: 'Sí, eliminar',
      cancelText: 'No, cancelar',
      onConfirm,
    });
  },

  warning: (options: Omit<ConfirmOptions, 'type'>): void => {
    confirmService.open({ ...options, type: 'warning' });
  },

  info: (options: Omit<ConfirmOptions, 'type'>): void => {
    confirmService.open({ ...options, type: 'info' });
  },

  success: (options: Omit<ConfirmOptions, 'type'>): void => {
    confirmService.open({ ...options, type: 'success' });
  },
};
