import { useToast } from 'primevue/usetoast';

export function useToastService() {
    const toast = useToast();

    const showSuccess = (message) => {
        toast.add({ severity: 'success', summary: 'Éxito', detail: message, life: 3000 });
    };

    const showError = (message) => {
        toast.add({ severity: 'error', summary: 'Error', detail: message, life: 3000 });
    };

    return { showSuccess, showError };
}
