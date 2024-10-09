<template>
    <div class="gadgets" :style="{ padding: padding }">
        <ods-tabs class="ods-flex ods-flex-wrap ods-justify-center" v-model="activeTab" :stretch="true" :tab-position="'top'">
            <ods-tab-pane v-for="(tab, index) in tabs" :key="index" :label="$t(tab.name)" :ref="'gadgetTab-' + tab.name" :name="tab.name" :class="tab.name === activeTab ? ' is-active' : ''">
                <span slot="label">
                    <ods-icon v-if="tab.name === 'fav'" :name="tab.name === activeTab ? 'star_on' : 'star_off'"></ods-icon>
                    <span v-else>{{ $t(`${tab.name}`) }}</span>
                </span>
                <gadgets-tree v-loading="loading" :gadgets="getGadgetsTree(tab.name)" :tab="tab.name" :datasource="datasource" :tree="gadgetTree" v-on="$listeners" v-bind="$attrs">
                    <template slot="header" v-if="tab.name === 'custom'">
                        <ods-select
                            v-model="datasource"
                            :filterable="true"
                            :clearable="true"
                            select-label="Datasource"
                            @change="(value) => $emit('add:datasource', value !== null ? { name: value, refresh: 0, type: 'query' } : { name: '#NEW', refresh: 0, type: 'query' })"
                        >
                            <ods-option v-for="(d, i) in datasources" :key="`datasource-${d.identification}-${i}`" :value="d.identification">
                                <template>
                                    {{ d.identification }} <br />
                                    <span style="font-size: 85%; color: #666">{{ d.description }}</span>
                                    <!-- <span class="edit-datasource"><i class="ods-icon-edit" style="font-size: 14px;font-weight: bold;"></i></span> -->
                                </template>
                            </ods-option>
                            <ods-option-group label="Options" v-if="datasourceEnabled">
                                <ods-option :value="null" :key="'datasource-#NEW1'">
                                    <template>
                                        New Datasource <br />
                                        <span style="font-size: 85%; color: #666">Create a New Datasource</span>
                                    </template>
                                </ods-option>
                            </ods-option-group>
                        </ods-select>
                    </template>
                </gadgets-tree>
            </ods-tab-pane>
        </ods-tabs>
    </div>
</template>

<script>
import i18n from './lang';
import { mapGetters } from 'vuex';
import { getGadgets } from '@/core/services/gadgets/gadgets';
import GadgetsTree from '@/core/components/gadgets/tree/GadgetsTree';

export default {
    name: 'Gadgets',
    i18n,

    components: {
        GadgetsTree
    },

    props: {
        dashboardKey: {
            type: Number,
            default: 0
        },
        padding: {
            type: String,
            default: '0'
        },
        datasources: {
            type: Array,
            default: () => []
        },
        options: {
            type: Object,
            default: () => {}
        }
    },

    data() {
        return {
            gadgets: [],
            defaultGadgets: [],
            favGadgets: [],
            activeTab: 'custom',
            tabs: [{ name: 'default' }, { name: 'custom' }, { name: 'fav' }],
            loading: true,
            datasource: {},
            // gadget tree backUp
            backUpTree: [
                {
                    id: '1',
                    name: 'bar',
                    types: ['bar', 'BarChart', 'mixed', 'timeseries', 'timeChart'],
                    icon: 'chart-bar',
                    children: []
                },
                {
                    id: '2',
                    name: 'line',
                    types: ['line', 'LineChart', 'area', 'mixed', 'timeseries'],
                    icon: 'chart-line',
                    children: []
                },
                {
                    id: '3',
                    name: 'circular',
                    types: ['pie', 'doughnut', 'rosetype'],
                    icon: 'pie-chart',
                    children: []
                },
                {
                    id: '4',
                    name: 'radar',
                    types: ['radar'],
                    icon: 'chart-bar',
                    children: []
                },
                {
                    id: '5',
                    name: 'kpi',
                    types: ['kpi', 'kpis', 'progress', 'carousel'],
                    icon: 'app',
                    children: []
                },
                {
                    id: '6',
                    name: 'map',
                    types: ['map', 'map-openLayers'],
                    icon: 'map',
                    children: []
                },
                {
                    id: '7',
                    name: 'table',
                    types: ['table', 'gadget-crud', 'gadget-import'],
                    icon: 'table',
                    children: []
                },
                {
                    id: '8',
                    name: 'layout',
                    types: ['header', 'footer', 'info'],
                    icon: 'table',
                    children: []
                }
            ]
        };
    },

    computed: {
        ...mapGetters({
            getCurrentGadgetsTree: 'getCurrentGadgetsTree'
        }),
        // get from dashboard options if the datasource drawer editor is enabled or not.
        datasourceEnabled() {
            return this.options?.datasources ? this.options.datasources : false;
        },
        // gadget tree initial configuration can be a backUp or centralized configuration.z
        gadgetTree() {
            var that = this;
            var tree = this.getCurrentGadgetsTree.length > 0 ? this.getCurrentGadgetsTree : this.backUpTree;
            var Copy = tree.slice();
            return Copy.map((b) => {
                const gadgets = that.activeTab === 'default' ? [...this.defaultGadgets] : that.activeTab === 'fav' ? [...this.favGadgets] : [...this.gadgets];
                const condition = (g) => {
                    const template = g.gadgetTemplate || g.template || g;
                    return template.identification && b.types.some((t) => template.identification.toUpperCase().includes(t.toUpperCase()));
                };
                b.children = gadgets
                    .filter((g) => condition(g))
                    .map((g, i) => {
                        const template = g.gadgetTemplate || g.template || g;
                        const id = template.identification;
                        const name = g.name || id;
                        return {
                            id: `${id}-${i}`,
                            favourite: g.favourite,
                            favGadget: g.favGadget,
                            name: g.name ? g.name : id,
                            // text: g.gadgetTemplate || g.template ? g.identification : this.$t(`${name}`)
                            text: this.$t(`${name}`) || id
                        };
                    })
                    .sort((a, b) => (a.name > b.name ? -1 : b.name > a.name ? 1 : 0));
                b.text = this.$t(`g-${b.name}`);
                return b;
            }).filter((b) => b.children.length > 0);
        },
        getGadgetsTree() {
            return (name) => {
                return name === 'default' ? this.defaultGadgets : name === 'fav' ? this.favGadgets : this.gadgets;
            };
        }
    },

    watch: {
        dashboardKey: {
            immediate: true,
            handler(key) {
                this.getFavGadgets();
                this.getDefaultGadgets();
            }
        }
    },

    created() {
        this.getGadgets();
        // this.$refs['gadgetTab-custom'][0].$el.click()
    },
    methods: {
        setFocus() {
            this.$nextTick(() => {
                setTimeout(() => {
                    this.$refs['gadgetTab-' + this.activeTab][0].$el.focus();
                }, 2000);
            });
        },
        async getGadgets() {
            try {
                const gadgets = await getGadgets({ group: 'custom' });
                this.gadgets = gadgets.filter((g) => g.type === 'vueJSODS' || g.type === 'vueJS');
            } finally {
                this.loading = false;
            }
        },
        async getFavGadgets() {
            try {
                const favGadgets = await getGadgets({ group: 'fav' });
                this.favGadgets = favGadgets.map((f) => {
                    return { ...f, favourite: true };
                });
            } finally {
                this.loading = false;
            }
        },
        async getDefaultGadgets() {
            try {
                const defaultGadgets = await getGadgets();
                this.defaultGadgets = defaultGadgets
                    .map((g) => {
                        return {
                            ...g,
                            favourite: this.favGadgets.map((f) => f.gadget && f.gadget.identification).includes(g.identification),
                            favGadget: this.favGadgets.find((f) => f.gadget && f.gadget.identification === g.identification)
                        };
                    })
                    .filter((g) => g.instance);
            } finally {
                this.loading = false;
            }
        }
    }
};
</script>

<style lang="scss" scoped>
.ods-select-dropdown__item {
    height: auto;
}
.ods-select-dropdown__item .edit-datasource {
    position: absolute;
    right: 14px;
    top: 18px;
    visibility: hidden;
}
.ods-select-dropdown__item:hover .edit-datasource {
    visibility: visible;
}
.gadgets {
    font-size: rem(12);
    ::v-deep .ods-tree {
        &-node {
            &.is-expanded {
                background-color: var(--color-bg-secondary);
                border-bottom: 1px solid var(--color-border-active);
            }
            &.is-children {
                background-color: var(--color-bg-primary);
                border: 1px solid var(--color-border-soft-divisor);
                .ods-icon-drag {
                    color: var(--color-txt-avatar);
                }
                .ods-tree-node {
                    &__content {
                        &:hover {
                            background-color: var(--color-bg-primary);
                            .ods-icon-drag {
                                color: var(--color-icon-interactive);
                            }
                        }
                    }
                }
            }
            &.is-parent {
                > .ods-tree-node__children {
                    margin: rem(8);
                    .ods-tree-node {
                        border: 1px solid var(--color-border-soft-divisor);
                        margin: rem(6) 0;
                        &:hover {
                            border-color: var(--color-border-interactive);
                        }
                    }
                }
            }
            &__content {
                padding: rem(8);
            }
        }
        &.is-dragging {
            .ods-tree-node:hover {
                &__content {
                    background-color: var(--color-bg-primary);
                }
                &.is-children {
                    color: var(--color-txt-interactive);
                    background-color: var(--color-bg-primary);
                    position: relative;
                    .ods-icon-drag {
                        color: var(--color-icon-interactive);
                    }
                }
            }
        }
    }
}
</style>
