// src/eventBus.js
import { reactive, watch } from 'vue';

const eventBus = reactive({
    emit(event, data) {
        this[event] = data;
    },
    on(event, callback) {
        watch(
            () => this[event],
            () => {
                if (this[event]) {
                    callback(this[event]);
                    this[event] = null;
                }
            }
        );
    }
});

export default eventBus;
