<template>
    <action-modal
        class="add-datalink-modal"
        ref="modal"
        v-model="visible"
        :showClose="true"
        width="80%"
        :title="$t('addDatalink.title')"
        :cancelButtonText="$t('decline')"
        :actionButtonText="$t('accept')"
        :cancelButton="false"
        @action="$emit('add:datalink', data)"
    >
        <p class="action-modal__subtitle">{{ $t('addDatalink.subtitle') }}</p>
        <!-- DATALINK FORM -->
        <!-- END DATALINK FORM -->
        <ods-module :header="$t('addDatalink.addConnections')" :body-style="{ padding: '12px' }" style="margin: 24px auto">
            <div class="datalink-form">
                <div>
                    <!-- gadget source -->
                    <ods-select
                        v-model="emitterGadget"
                        :multiple="false"
                        :disabled="false"
                        :collapse-tags="false"
                        :size="'default'"
                        :clearable="true"
                        :placeholder="'select source gadget'"
                        :filterable="true"
                        :allow-create="true"
                        @change="refreshGadgetEmitterFields(emitterGadget)"
                    >
                        <ods-option v-for="item in gadgetsSources" :key="item.id" :label="item.prettyTitle" :value="item.id">{{ item.prettyTitle }}</ods-option>
                    </ods-select>
                </div>
                <div>
                    <!-- source fields -->
                    <ods-select v-model="emitterGadgetField" :multiple="false" :disabled="false" :collapse-tags="false" :size="'default'" :clearable="true" :placeholder="'select source field'" :filterable="true" :allow-create="true">
                        <ods-option v-for="field in gadgetEmitterFields" :key="field.name" :value="field.name">{{ field.name }}</ods-option>
                    </ods-select>
                </div>
                <div>
                    <!-- gadget target -->
                    <ods-select
                        v-model="targetGadget"
                        :multiple="false"
                        :disabled="false"
                        :collapse-tags="false"
                        :size="'default'"
                        :clearable="true"
                        :placeholder="'select target gadget'"
                        :filterable="true"
                        :allow-create="true"
                        @change="refreshGadgetTargetFields(targetGadget)"
                    >
                        <ods-option v-for="item in gadgetsTargets" :key="item.id" :label="item.prettyTitle" :value="item.id">{{ item.prettyTitle }}</ods-option>
                    </ods-select>
                </div>
                <div>
                    <!-- target field -->
                    <ods-select v-model="targetGadgetField" :multiple="false" :disabled="false" :collapse-tags="false" :size="'default'" :clearable="true" :placeholder="'select target field'" :filterable="true" :allow-create="true">
                        <ods-option v-for="field in gadgetTargetFields" :key="field.name" :value="field.name">{{ field.name }}</ods-option>
                    </ods-select>
                </div>
                <div>
                    <!-- add datalink-->
                    <ods-button type="secondary" @click="create(emitterGadget, emitterGadgetField, targetGadget, targetGadgetField, filterChaining)"><i class="ods-icon-plus"></i></ods-button>
                </div>
            </div>
        </ods-module>

        <!-- DATALINK CONNECTIONS TABLE -->
        <ods-module :header="$t('addDatalink.showConnections')" :body-style="{ padding: '12px' }">
            <div class="ods-flex">
                <ods-table
                    ref="connectionsTable"
                    :data="connections"
                    :emptyText="$t('addDatalink.emptyText')"
                    :size="'small'"
                    :height="'300px'"
                    :highlight-current-row="false"
                    :fit="true"
                    :default-sort="{ prop: 'source', order: 'descending' }"
                    style="width: 100%"
                >
                    <ods-table-column type="index" width="75"></ods-table-column>
                    <ods-table-column property="source" label="Gadget/External Source" sortable>
                        <template slot-scope="scope">
                            {{ generateGadgetInfo(scope.row.source) }}
                        </template>
                    </ods-table-column>
                    <ods-table-column property="sourceField" label="Source Field" sortable></ods-table-column>
                    <ods-table-column property="target" label="Gadget Target" sortable>
                        <template slot-scope="scope">
                            {{ generateGadgetInfo(scope.row.target) }}
                        </template>
                    </ods-table-column>
                    <ods-table-column property="targetField" label="Target Field"></ods-table-column>
                    <ods-table-column label="Actions">
                        <template slot-scope="scope">
                            <ods-tooltip class="item" effect="dark" :content="'Edit ' + scope.row.source" placement="top-start">
                                <ods-button size="small" type="secondary" @click="edit(scope.row)">
                                    <i class="ods-icon-edit" style="font-size: 0.9rem"></i>
                                </ods-button>
                            </ods-tooltip>
                            <ods-tooltip class="item" effect="dark" :content="'Remove Connection' + scope.row.source" placement="top-start">
                                <ods-button size="small" type="secondary" @click="remove(scope.row)"><i class="ods-icon-delete" style="font-size: 0.9rem"></i> </ods-button>
                            </ods-tooltip>
                        </template>
                    </ods-table-column>
                </ods-table>
            </div>
        </ods-module>
    </action-modal>
</template>

<script>
import i18n from './lang';
import ActionModal from '@/core/components/shared/ActionModal';
import { ModalFunctionality } from '@/core/mixins/modal';
import { getDatasourceFields } from '@/core/services/datasources/datasources';

export default {
    name: 'AddDatalinkModal',
    i18n,

    components: {
        ActionModal
    },
    data() {
        return {
            // objeto con toda la info para la funcion de retorno.
            data: {},
            loaded: false,

            // datalinks y modelo
            connections: [],
            dashboard: {},
            datalink: {}, // form model
            gadgetsSources: [],
            gadgetsTargets: [],
            synopticedit: undefined,
            selectedpage: 0,
            // emitter gadget
            emitterGadget: '',
            emitterGadgetField: '',
            gadgetEmitterFields: [],
            emitterDatasource: '',
            // target gadget
            targetGadget: '',
            targetDatasource: '',
            targetGadgetField: '',
            gadgetTargetFields: [],
            filterChaining: false
        };
    },
    watch: {
        visible: {
            // Watch for dashboard change, then init filter selectors
            immediate: true,
            handler(visible) {
                if (!visible || typeof window.DSApi.inst1 === 'undefined') {
                    return false;
                } else {
                    this.dashboard = window.DSApi.inst1.api.getModel();
                    this.initConnectionsList();
                    this.generateGadgetsLists();
                }
            }
        }
    },
    methods: {
        async initConnectionsList() {
            this.dashboard = typeof window.DSApi.inst1 !== 'undefined' ? window.DSApi.inst1.api.getModel() : {};
            this.connections = [];
            if (typeof window.DSApi.inst1 === 'undefined') {
                return false;
            }

            try {
                const rawInteractions = await window.DSApi.inst1.api.datalink.getInteractionHashWithoutGadgetFilters();
                for (var source in rawInteractions) {
                    for (var indexFieldTargets in rawInteractions[source]) {
                        for (var indexTargets in rawInteractions[source][indexFieldTargets].targetList) {
                            var rowInteraction = {
                                source: source,
                                sourceField: rawInteractions[source][indexFieldTargets].emiterField,
                                target: rawInteractions[source][indexFieldTargets].targetList[indexTargets].gadgetId,
                                targetField: rawInteractions[source][indexFieldTargets].targetList[indexTargets].overwriteField,
                                filterChaining: rawInteractions[source][indexFieldTargets].filterChaining
                            };
                            this.connections.push(rowInteraction);
                        }
                    }
                }
            } finally {
                console.log('connections loaded...');
                this.loaded = true;
            }
        },

        // generate info from gadget
        generateGadgetInfo(gadgetId) {
            var gadget = this.findGadgetInDashboard(gadgetId);
            if (gadget == null) {
                return gadgetId;
            } else {
                return this.prettyGadgetInfo(gadget);
            }
        },

        // find gadget in pages
        findGadgetInDashboard(gadgetId) {
            for (var p = 0; p < this.dashboard.pages.length; p++) {
                var page = this.dashboard.pages[p];
                for (var i = 0; i < page.layers.length; i++) {
                    var layer = page.layers[i];
                    var gadgets = layer.gridboard.filter(function (gadget) {
                        return gadget.id === gadgetId;
                    });
                    if (gadgets.length) {
                        return gadgets[0];
                    }
                }
            }
            return null;
        },

        // synotic gadget or normal gadget title and type
        prettyGadgetInfo(gadget) {
            if (gadget.type === 'synoptic') {
                if (typeof gadget.header === 'undefined') {
                    return gadget.id;
                } else {
                    return gadget.header.title.text;
                }
            } else {
                if (typeof gadget.header === 'undefined') {
                    return gadget.id;
                } else {
                    return gadget.header.title.text + ' (' + (gadget.template ? gadget.template : gadget.type) + ')';
                }
            }
        },

        // generate gadgets template list
        async generateGadgetsLists() {
            try {
                this.gadgetsSources = this.getGadgetsSourcesInDashboard();
                this.gadgetsTargets = this.getGadgetsInDashboard();
            } finally {
                if (typeof this.synopticedit !== 'undefined' && typeof this.synopticedit.showSynoptic !== 'undefined' && this.synopticedit.showSynoptic) {
                    var synop = { id: 'synoptic', header: { title: { text: 'synoptic' } }, type: 'synoptic' };
                    this.gadgetsSources = this.gadgetsSources.concat(synop);
                    this.gadgetsTargets = this.gadgetsTargets.concat(synop);
                }
            }
        },

        // get gadgets sources in current dashboard
        getGadgetsSourcesInDashboard() {
            var gadgets = [];
            var typeGadgetList = ['pie', 'bar', 'line', 'wordcloud', 'mixed', 'table', 'gadgetfilter', 'livehtml', 'map', 'radar'];
            var page = this.dashboard.pages[this.selectedpage];
            for (var i = 0; i < page.layers.length; i++) {
                var layer = page.layers[i];
                var gadgetsAux = layer.gridboard.filter(function (gadget) {
                    return typeGadgetList.indexOf(gadget.type) !== -1;
                });
                if (gadgetsAux.length) {
                    gadgets = gadgets.concat(gadgetsAux);
                }
            }
            if (gadgets != null && gadgets.length > 0) {
                for (var gad in gadgets) {
                    gadgets[gad].prettyTitle = this.prettyGadgetInfo(gadgets[gad]);
                }
            }
            return gadgets;
        },

        // get gadget targets in dashboard
        getGadgetsInDashboard() {
            var gadgets = [];
            var page = this.dashboard.pages[this.selectedpage];
            for (var i = 0; i < page.layers.length; i++) {
                var layer = page.layers[i];
                var gadgetsAux = layer.gridboard.filter(function (gadget) {
                    return typeof gadget.id !== 'undefined';
                });
                if (gadgetsAux.length) {
                    gadgets = gadgets.concat(gadgetsAux);
                }
            }
            return gadgets;
        },

        // change for emitterGadget (source)
        refreshGadgetEmitterFields(prettyTitle) {
            var gadgetId = null;
            // find gadgetid
            gadgetId = this.findEmitterGadgetID(prettyTitle);
            var gadget = this.findGadgetInDashboard(gadgetId);
            if (gadget == null) {
                this.gadgetEmitterFields = [];
            } else {
                this.setGadgetEmitterFields(gadget);
            }
        },

        // change for targetGadget (target)
        refreshGadgetTargetFields(gadgetId) {
            var gadget = this.findGadgetInDashboard(gadgetId);
            if (gadget == null) {
                this.gadgetEmitterFields = [];
            } else {
                this.setGadgetTargetFields(gadget);
            }
        },

        // get target gadget fields
        async setGadgetTargetFields(gadget) {
            var dsId = '';
            this.targetDatasource = '';
            this.gadgetTargetFields = [];
            if (gadget.type === 'livehtml') {
                if (typeof gadget.datasource !== 'undefined') {
                    this.targetDatasource = gadget.datasource.name;
                    dsId = gadget.datasource.id;
                }
            } else if (gadget.type === 'gadgetfilter') {
                this.targetDatasource = gadget.datasource.name;
                dsId = gadget.datasource.id;
            } else {
                this.targetDatasource = gadget.measures[0].datasource.identification;
                dsId = gadget.measures[0].datasource.id;
            }
            if (typeof dsId !== 'undefined') {
                const fields = await getDatasourceFields(dsId);
                this.gadgetTargetFields = fields;
                console.log('Target fields: ', this.gadgetTargetFields);
            }
        },

        // get the id of emitter gadget
        findEmitterGadgetID(prettyTitle) {
            if (this.gadgetsSources != null && this.gadgetsSources.length > 0) {
                for (var gad in this.gadgetsSources) {
                    if (prettyTitle === this.gadgetsSources[gad].prettyTitle) {
                        return this.gadgetsSources[gad].id;
                    }
                }
            }
            return prettyTitle;
        },

        // set the emitter gadget fields
        async setGadgetEmitterFields(gadget) {
            this.gadgetEmitterFields = [];
            switch (gadget.type) {
                case 'livehtml':
                    if (typeof gadget.datasource !== 'undefined') {
                        this.emitterDatasource = gadget.datasource.name;
                    }
                    if (typeof gadget.datasource !== 'undefined' && typeof gadget.datasource.id !== 'undefined') {
                        const fields = await getDatasourceFields(gadget.datasource.id);
                        this.gadgetEmitterFields = fields;
                        console.log('Emiter fields: ', this.gadgetEmitterFields);
                    }
                    break;
            }
        },

        // create datalink
        create(sourceGadgetId, originField, targetGadgetId, destinationField, filterChaining) {
            // sourceGadgetId, targetGadgetId, originField, destinationField,undefined,filterChaining,undefined
            if (sourceGadgetId && originField && targetGadgetId && destinationField) {
                window.DSApi.inst1.api.datalink.registerGadgetInteractionDestination(sourceGadgetId, targetGadgetId, originField, destinationField, undefined, filterChaining, undefined);
                this.initConnectionsList();
            }
        },

        // remove datalink from table
        remove(row) {
            if (!row) {
                return false;
            }
            // sourceGadgetId, targetGadgetId, originField, destinationField,filterChaining
            window.DSApi.inst1.api.datalink.unregisterGadgetInteractionDestination(row.source, row.target, row.sourceField, row.targetField, this.filterChaining);
            this.initConnectionsList();
        }
    },
    mounted() {
        // init datalink selectors
        this.emitterGadget = undefined;
        this.emitterGadgetField = undefined;
        this.targetGadget = undefined;
        this.targetGadgetField = undefined;
    },
    mixins: [ModalFunctionality]
};
</script>

<style lang="scss">
.datalink-form {
    margin-left: 14px;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: 1fr;
    grid-column-gap: 30px;
    grid-row-gap: 0px;
}
</style>
