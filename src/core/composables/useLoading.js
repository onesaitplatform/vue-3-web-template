import { ref } from 'vue';

const isLoading = ref(false);
const loadingMessage = ref('');

export function useLoading() {
    const startLoading = (message = 'Loading...') => {
        isLoading.value = true;
        loadingMessage.value = message;
    };

    const stopLoading = () => {
        isLoading.value = false;
        loadingMessage.value = '';
    };

    return {
        isLoading,
        loadingMessage,
        startLoading,
        stopLoading
    };
}
