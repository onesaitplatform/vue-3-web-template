<template>
  <div class="subheader">
    <ods-sub-header :is-absolute="true">
        <div class="toolbar" v-if="showFilters" >
          <div class="toolbar__section-inline">
            <form-filter v-if="dynFilters.length > 0" :filters="dynFilters.sort((a,b) => a.order - b.order)" :dashboardId="dashboardId" :location="location"></form-filter>
          </div>
        </div>
        <template slot="ctas">
          <div class="toolbar__section">
            <!-- search gadgets and dashboards -->
            <ods-tooltip :effect="'dark'" :content="$t('filters.search')" :placement="'top'" :offset="-130" v-if="showFavorites">
              <ods-input-search ref="searchBtn" v-model="query" :size="'mega'" :placeholder="$t('filters.search')" :expandableSearch="true" :clearable="true" type="neutral" :icon="searchIcon" @search="handleSearch"></ods-input-search>
            </ods-tooltip>
            <ods-tooltip  :content="$t('filters.view_dashboard')" :placement="'left'" v-if="editmode">
              <ods-button class="subheader-btn" :title="$t('filters.view_dashboard')" v-if="dashboardId" @click="goToDashboards" type="neutral" :text="$t('filters.view_dashboard')"  :iconPosition="'right'" :icon="'ods-icon-cards'" :size="'medium'" :nativeType="'text'"></ods-button>
            </ods-tooltip>
            <ods-tooltip  :content="'Toggle EditMode'" :placement="'left'" v-if="editmode">
              <ods-button class="subheader-btn" :title="'Toggle EditMode'" v-if="dashboardId" @click="toggleEditMode" type="neutral" :text="'Toggle editMode'"  :iconPosition="'right'" :icon="'ods-icon-edit'" :size="'medium'" :nativeType="'text'"></ods-button>
            </ods-tooltip>
            <ods-tooltip  :content="$t('filters.datalink_dashboard')" :placement="'left'" v-if="editmode">
              <ods-button class="subheader-btn" :title="$t('filters.datalink_dashboard')" v-if="dashboardId" @click="openAddDatalinkModal(dashboardId)" type="neutral" :text="$t('filters.datalink_dashboard')"  :iconPosition="'right'" :icon="'ods-icon-sync'" :size="'medium'" :nativeType="'text'"></ods-button>
            </ods-tooltip>
            <ods-tooltip  :content="'DATASOURCES'" :placement="'left'" v-if="editmode && datasourceEnabled">
              <ods-button class="subheader-btn" :title="'datasources'" v-if="dashboardId" @click="openDatasource()" type="neutral" :text="'Datasources'"  :iconPosition="'right'" :icon="'ods-icon-database'" :size="'medium'" :nativeType="'text'"></ods-button>
            </ods-tooltip>
            <ods-tooltip  :content="$t('filters.save_dashboard')" :placement="'left'" v-if="editmode">
              <ods-button class="subheader-btn" :title="$t('filters.save_dashboard')" v-if="dashboardId" @click="saveDashboard" type="neutral" :text="$t('filters.save_dashboard')"  :iconPosition="'right'" :icon="'ods-icon-save'" :size="'medium'" :nativeType="'text'"></ods-button>
            </ods-tooltip>
          </div>
        </template>
        <div v-if="showActiveFilters" class="toolbar__filters">
          <div class="toolbar__section">
            <label v-if="dashboardCurrentFilters.length > 0" class="ods-form-item__label">{{$t('filters.activeFilters')}}:</label> <ods-tag v-for="item in dashboardCurrentFilters" :key="item.id" type="active" :closable=!1 style="margin-right: 4px; border-radius: 4px;" :title="item.filterValue"> {{ (item.label).toUpperCase() + item.label ? ': ' : ' '}} {{ item.filterValue | truncate(25) }} </ods-tag>
          </div>
        </div>
    </ods-sub-header>
    <ods-module v-if="searchResults" class="search-results" :header="'Resultados de la Búsqueda:'" :shadow="'always'" v-click-outside="closeResults">
        <div style="margin-bottom: 20px">
          <div v-if="searchTotalResults === 0">{{$t('filters.search_NoResults')}}</div>
          <ods-table :data="searchItems" :border="false" :stripe="false" :size="'medium'" :fit="true"  height="300"  :emptyText="$t('filters.search_NoResults')" @row-click="goToDashboard">
            <ods-table-column prop="title"  sortable label="Gadget" width="350">
              <template slot-scope="scope">
                <ods-icon :name="getGadgetIcon(scope.row)" size="12"></ods-icon>
                <span style="margin-left: 10px">{{ scope.row.title }}</span>
              </template>
            </ods-table-column>
            <ods-table-column prop="dashboardIdentification" sortable  label="Dashboard"></ods-table-column>
          </ods-table>
        </div>
    </ods-module>
    <add-datalink-modal v-model="datalinkModal.visible" @add:datalink="(data) => addDatalink(data)"></add-datalink-modal>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import FormFilter from '../../forms/formFilter.vue'
import AddDatalinkModal from '../modals/AddDatalinkModal.vue'
import { HTTP_PLATFORM } from '../../../store/modules/http'
import moment from 'moment'
export default {
  name: 'ToolBarFilter',
  components: {
    FormFilter,
    AddDatalinkModal
  },
  props: {
    options: {
      type: Object,
      default: () => {}
    },
    dynFilters: { type: Array, required: true },
    showFilters: { type: Boolean, required: true },
    dashboardId: { type: String, required: true },
    editmode: { type: Boolean, required: true },
    location: { type: String, required: true }
  },
  data () {
    return {
      // default values
      logControl: true,
      favoriteIsOpen: false,
      filterIsOpen: false,
      optionSelected: 'default',
      query: '',
      searchLoading: false,
      searchResults: false,
      searchIcon: 'search',
      searchTotalResults: 0,
      searchItems: [],
      dashboardCurrentFilters: [],
      datalinkModal: {
        visible: false
      },
      toggleEdit: true
    }
  },
  directives: {
    'click-outside': {
      bind: function (element, binding, vnode) {
        element.clickOutsideEvent = function (event) {
          // check that click was outside the el and his children
          if (!(element === event.target || element.contains(event.target))) {
            // and if it did, call method provided in attribute value
            vnode.context[binding.expression](event)
          }
        }
        document.body.addEventListener('click', element.clickOutsideEvent)
      },
      unbind: function (element) {
        document.body.removeEventListener('click', element.clickOutsideEvent)
      }
    }
  },
  methods: {
    toggleFavorite () {
      this.favoriteIsOpen = !this.favoriteIsOpen
      this.optionSelected = this.favoriteIsOpen ? 'favorite' : 'default'
      this.filterIsOpen = false
    },

    toggleFilter () {
      this.filterIsOpen = !this.filterIsOpen
      this.optionSelected = this.filterIsOpen ? 'filter' : 'default'
      this.favoriteIsOpen = false
    },

    // SEARCH GADGETS IN PROYECT (REALM) OR GENERIC
    async handleSearch () {
      try {
        if (this.logControl) { console.log('searchGadgets(): ', this.query) }
        if (!this.query || this.query.length < 3) { return false }
        // run search
        this.searchLoading = true
        const app = this.getCurrentApp
        const appProject = app.project || ''
        const searchApiEndPoint = '/api-manager/server/api/v1/gadgetFinder/findGadget/' + appProject + '/' + this.query + '/'
        this.searchIcon = this.searchLoading ? 'loading' : 'search'

        // TO-DO: 1º launch searching icon , 2º run query, 3º get results, 4º no-result icon or module zone with text, querystring and results, 5 reset icon to search
        const searchElements = await HTTP_PLATFORM.get(searchApiEndPoint, { headers: { 'Content-Type': 'application/json', Accept: 'application/json' } })
        if (this.logControl) { console.log('searchGadgets() |--> Results', JSON.stringify(searchElements)) }
        this.searchLoading = false
        this.searchIcon = 'search'
        if (searchElements.data.length > 0) {
          this.searchResults = true
          this.searchTotalResults = searchElements.data.length
          // avoid duplicates
          // this.searchItems = searchElements.data
          this.searchItems = searchElements.data.filter((v, i, a) => a.findIndex(t => (t.dashboardId === v.dashboardId && t.title === v.title)) === i)
        } else {
          // search done, but no results
          this.searchLoading = false
          this.searchIcon = 'search'
          this.$notify({
            title: 'Gadget Search',
            message: 'No gadgets found.',
            type: 'warning',
            iconClass: 'ods-icon-search',
            duration: 2500,
            position: 'top-right',
            showClose: true
          })
          this.closeResults()
        }
      } catch (error) {
        console.log('ERROR CALLING SEARCH GADGETS', error)
        this.searchLoading = false
        this.searchIcon = 'search'
        return error
      }
    },

    closeResults () {
      // close results if open and click outside or close de search
      this.searchResults = false
      console.log('cerrando search results')
      this.$refs.searchBtn.inputValue = ''
      this.$refs.searchBtn.isExpanded = false
    },

    dragStartHandler (ev) {
      if (ev.dataTransfer) {
        ev.dataTransfer.setData('type', 'livehtml')
        ev.dataTransfer.dropEffect = 'copy'
      }
    },

    addData (item, e) {
      console.log('datatransfer...' + JSON.stringify(item))
      if (item.type !== 'livehtml') {
        e.dataTransfer.setData('gid', item.id)
        e.dataTransfer.setData('title', item.title)
        e.dataTransfer.setData('type', item.type)
      } else {
        e.dataTransfer.setData('gid', item.id)
        e.dataTransfer.setData('title', item.title)
        e.dataTransfer.setData('type', 'livehtml')
      }
    },
    addRawGadget (item, e) {
      e.dataTransfer.setData('title', item.title)
      e.dataTransfer.setData('type', 'livehtml')
      e.dataTransfer.setData('config', item.config)
    },

    saveDashboard () {
      if (this.dashboardId) {
        this.$parent.saveDashboard()
      }
    },

    toggleEditMode () {
      if (this.toggleEdit) {
        document.querySelectorAll('.item-buttons').forEach(function (item) { item.style.display = 'none' })
        document.querySelectorAll('.md-toolbar-tools').forEach(function (item) { item.style.display = 'none' })
        this.toggleEdit = false
      } else {
        document.querySelectorAll('.item-buttons').forEach(function (item) { item.style.display = 'flex' })
        document.querySelectorAll('.md-toolbar-tools').forEach(function (item) { item.style.display = 'flex' })
        this.toggleEdit = true
      }
    },

    openAddDatalinkModal (dashboard) {
      this.datalinkModal.visible = true
    },
    // Add datalinks to dashboard
    addDatalink (data) {
      console.log('ADD DATALINK...', data)
      this.datalinkModal.visible = false
    },
    goToDashboards () {
      console.log('Go to Dashboards Section...')
      this.$router.push({ name: 'AdminDashboards' })
    },

    goToDashboard (row) {
      console.log('seleccionando Fila de Busqueda: ' + JSON.stringify(row))
      if (row.dashboardId) {
        this.$router.push({ name: 'Dashboard', params: { dashboardId: row.dashboardId } })
        this.closeResults()
      }
    },
    // get activeFilters if is configured in customization.
    getActiveFilters (globalFilters) {
      var app = this
      var allowed = []
      var activeFilters = []
      var filters = globalFilters

      // AUXILIAR FUNCTIONS
      var isAuthorized = function (item) {
        var authorizations = item.schema.authorizations || []
        var authorization = true
        if (authorizations.length > 0) {
          authorization = authorizations.filter(x => x === app.dashboardId).length > 0
          return authorization
        } else {
          return true
        }
      }

      if (this.showActiveFilters) {
        // get active filters and print tags with current active filters values
        allowed = filters.filter(x => isAuthorized(x))
        if (allowed.length === 0) { this.dashboardCurrentFilters = []; return false }
        // iterate allowed and show filters correctly
        allowed.forEach((item) => {
          if (item.schema.fieldType === 'datePicker') {
            if ((item.schema.dateType === 'daterange' || item.schema.dateType === 'datetimerange') && item.filter.activeFilter.length > 0) {
              activeFilters.push({ id: item.id, label: item.schema.label, filterValue: moment(item.filter.activeFilter[0], item.schema.dateFormat).format('DD/MM/YYYY') + ' - ' + moment(item.filter.activeFilter[1], item.schema.dateFormat).format('DD/MM/YYYY') })
            } else {
              activeFilters.push({ id: item.id, label: item.schema.label, filterValue: moment(item.filter.activeFilter, item.schema.dateFormat).format('DD/MM/YYYY') })
            }
          } else if (item.schema.fieldType === 'SelectList') {
            if (item.schema.multi && item.filter.activeFilter.length > 0) {
              activeFilters.push({ id: item.id, label: item.schema.label, filterValue: item.filter.activeFilter.join(', ') })
            } else if (!item.schema.multi && item.filter.activeFilter !== '') {
              activeFilters.push({ id: item.id, label: item.schema.label, filterValue: item.filter.activeFilter })
            }
          }
        })
        this.dashboardCurrentFilters = activeFilters
      }
    },
    openDatasource () {
      this.$emit('show:datasources', this.dashboardId)
    }
  },
  computed: {
    ...mapGetters({
      loginType: 'getLoginType',
      getCurrentApp: 'getCurrentApp',
      getCustomization: 'getCurrentCustomization',
      getGlobalFilters: 'getGlobalFilters'
    }),

    // get from dashboard options if the datasource drawer editor is enabled or not.
    datasourceEnabled () {
      return this.options?.datasources ? this.options.datasources : false
    },

    getGadgetIcon: function () {
      return function (row) {
        // TO-DO: apply others icons
        var gadgetType = row.type
        var icon = gadgetType === 'bar' ? 'chart-bar' : 'square-map'
        return icon
      }
    },
    showFavorites () {
      var showFavoritesTab = true
      var customization = this.getCustomization || {}
      if (customization && customization.showfavorites !== 'undefined') {
        showFavoritesTab = customization.showfavorites
      }
      return showFavoritesTab
    },
    showActiveFilters () {
      var showFilters = false
      var customization = this.getCustomization || {}
      if (customization && customization.showActiveFilters !== 'undefined') {
        showFilters = customization.showActiveFilters
      }
      return showFilters
    },
    activeFilters () {
      var data = this.getGlobalFilters
      return data
    }
  },
  watch: {
    '$route.params.dashboardId': {
      // Watch for dashboard change, then init filter selectors
      immediate: true,
      handler (dashboardId) {
      }
    },
    activeFilters: {
      deep: true,
      immediate: true,
      handler (obj) {
        // execute get activeFilters to show active filters on this dashboard
        this.getActiveFilters(obj)
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.subheader { min-height: 3.15rem !important;}
.toolbar {
  display: flex; justify-content: space-between; width: 100%; height: rem(30);
  &__section {
    display: flex; align-items: center; flex-direction: row;
  }
  &__section-inline {
    display: inline-flex; align-items: center; flex-direction: row;
  }
  &__filters {
    display: flex; align-items: center; flex-direction: row; width: 60%; justify-content: flex-end;
  }
}
.favorite {
  display:block;
  &--open {
    transition: all 0.4s ease;
  }
}
.filter {
  display:block;
  &--open {
    transition: all 0.4s ease;
  }
}
.gadgetFavorite {
  background-color: #2e6c99;
    padding: $space-050 16px;
    height: 24px;
    line-height: 14px;
    font-size: 9px;
    color: #fff;
    border-radius: 6px;
    box-sizing: border-box;
    white-space: nowrap;
    text-transform: uppercase;
    font-family: soho,Helvetica Neue,Helvetica,Arial,sans-serif;
    font-weight: 500;
    letter-spacing: .2px;
    border: 1px solid;
    display: inline-flex;
    align-items: center;
    margin-right: 6px;
}

.search-results {
  position: absolute;
  top: 50px;
  right: 60px;
  width: 600px;
  height: 400px;
  z-index: 10;
  border-bottom: 0px !important;
  border-radius: 0px !important;
}

.subheader {
  border-bottom: 1px solid var(--color-border-hard-divisor);

  & ::v-deep .ods-input--search {
    flex-direction: row-reverse;
    padding-right: $space-050;
  }

  & ::v-deep .ods-input-search--is-clearable .ods-input__suffix {
    margin-right: rem(-32)
  }
}
.subheader-btn{
  margin: 0 0.75rem;
}
::v-deep .ods-scrollbar__wrap--custom { height: 42px; background-color: #fff;  padding: 6px; }
::v-deep .ods-table__row { cursor: pointer!important }
::v-deep .ods-sub-header__main { width: 100% }
::v-deep .ods-sub-header--mini { min-height: 3.1rem!important;}
::v-deep .ods-sub-header { background: var(--color-bg-primary) }
::v-deep .item-buttons-hide { display: none; }
</style>
