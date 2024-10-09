<template>
  <div class="sidebarfilter" :class="[isOpen ? 'sidebarfilter--open' : '', hasTopBar ? '' : 'sidebarfilter-noTopBar']" v-click-outside="handleOpenOutside">
    <div class="sidebarfilter__container">
      <ods-tooltip :effect="'dark'" :content="$t('filters.showhide')" :placement="'right'">
        <ods-icon  @click.native="handleOpen" :name="isOpen ? 'double-left' : 'double-right'" size="20"  style="text-align: center; cursor: pointer; width: 100%; text-align:right; color: grey;"></ods-icon>
      </ods-tooltip>
      <!-- new tabs -->
      <ods-tabs v-show="isOpen2" :tab-position="'top'" :stretch="false">
        <!-- GADGET PANE -->
        <ods-tab-pane :key="'sidebar-tab-gadgets'" class="ods-py-6" :label="$t('filters.gadgets')" v-if="editmode">
          <ods-scrollbar :wrapClass="'scrollbar-gadgetree'" :tag="'div'" :alwaysVisible="true" :wrapStyle="setHeight">
            <gadgets ref="gadgets" v-bind="$attrs" v-on="$listeners" :options="options" padding="0px 12px"></gadgets>
          </ods-scrollbar>
         </ods-tab-pane>
        <!-- GLOBAL FILTERS PANE -->
        <ods-tab-pane :key="'sidebar-tab-filters'" class="ods-py-6" :label="$t('filters.filters')" v-if="showFilters && hasFilters">
            <form-filter v-if="dynFilters.length > 0" :filters="dynFilters.sort((a,b) => a.order - b.order)" :dashboardId="dashboardId" :location="location"></form-filter>
        </ods-tab-pane>
        <!-- FAVORITES PANE -->
        <ods-tab-pane :key="'sidebar-tab-favourites'" class="ods-py-6" :label="$t('filters.favorites')" v-if="showFavorites">
          <transition name="fade" mode="in-out">
            <div class="favorite" style="min-height: 400px">
              <ods-input :placeholder="$t('filters.favorites_search')" v-model="filterFavorite" class="ods-mb-6"></ods-input>
              <ods-scrollbar wrap-class="ods-scrollbar__wrap--custom" :tag="'div'" >
                <!-- favorites. -->
                <div v-if="this.favorites.length == 0">{{$t('filters.noFavorites')}}</div>
                <div class="gadgetFavorite" :key="item.title" v-for="item in this.filteredFavorites" :title="item.title" draggable="true" @dragstart="addData(item, $event)">
                  <div style="max-width: 140px;text-overflow: ellipsis;white-space: nowrap;overflow: hidden;"> {{item.title}} </div>
                  <ods-icon  @click.native="removeFavorite(item.title)" :name="'close'" size="12" :title="'Borrar ' + item.title" style="font-size: 12px; color: white; cursor: pointer; float: right; position: relative; top: -12px;"></ods-icon>
                </div>
              </ods-scrollbar>
            </div>
          </transition>
        </ods-tab-pane>
      </ods-tabs>
      <!-- new tabs -->
    </div>
  </div>
</template>

<script>
import { HTTP_PLATFORM } from '../../../store/modules/http'
import FormFilter from '../../forms/formFilter.vue'
import Gadgets from '../gadgets/Gadgets'
import { mapActions, mapGetters } from 'vuex'
export default {
  name: 'SideBarFilter',
  components: {
    FormFilter,
    Gadgets
  },
  props: {
    options: {
      type: Object,
      default: () => {}
    },
    favorites: { type: Array, required: true, default () { return [] } },
    dynFilters: { type: Array, required: true },
    showFilters: { type: Boolean, required: true },
    dashboardId: { type: String, required: true },
    editmode: { type: Boolean, required: true },
    location: { type: String, required: true },
    close: { type: Boolean, required: false, default: false }
  },
  data () {
    return {
      // default values
      isOpen: false,
      isOpen2: false,
      filterText: '',
      filterFavorite: '',
      currentEntity: '',
      currentSegment: '',
      currentProduct: '',
      indentData: 16,
      dashboardKey: 0,
      datasources: [],
      gadget: {
        datasource: {}
      }
    }
  },

  watch: {
    filterText (val) {
      this.$refs.tree.filter(val)
    },
    close (val) {
      if (val) {
        this.isOpen = false
      }
    },
    isOpen (nval) {
      if (nval) {
        setTimeout(() => {
          this.isOpen2 = true
        }, 200)
      } else {
        this.isOpen2 = false
      }
    },
    '$route.params.dashboardId': {
      // Watch for dashboard change, then init filter selectors
      immediate: true,
      handler (dashboardId) {
        this.isOpen = false
      }
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
    ...mapActions([
      'sendNewFilter'
    ]),
    // test function for new sendFilter vectorial
    newSendFilters () {
      this.sendNewFilter({ filterId: 'external-filters', dashboardId: this.dashboardId })
    },
    handleOpen () {
      this.isOpen = !this.isOpen
      this.DashboardResize() // resize dashboards every time that open/close filters
    },
    handleOpenOutside () {
      if (this.isOpen) { this.isOpen = !this.isOpen }
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
    filterNode (value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    async removeFavorite (item) {
      console.log('borrando item: ', item)
      var app = this
      if (item === '') {
        return false
      }
      try {
        var removeFavoriteEndPoint = '/controlpanel/api/favoritegadget/' + item
        const removeFavorite = await HTTP_PLATFORM.delete(removeFavoriteEndPoint, { headers: { 'Content-Type': 'application/json', Accept: 'application/json' } })
        if (removeFavorite) {
          app.$parent.reloadFavorites()
          this.$notify({
            title: 'Favourite deleted',
            message: 'the gadget was successfully deleted',
            type: 'success',
            iconClass: 'ods-icon-checkmark-2',
            duration: 2500,
            position: 'top-right',
            showClose: true
          })
        }
      } catch (error) {
        console.log('Error removing Favorite', error)
        this.$notify({
          title: 'APP:',
          message: 'The gadget can´t be removed.',
          type: 'danger',
          iconClass: 'ods-icon-warning',
          duration: 2500,
          position: 'top-right',
          showClose: true
        })
        return error
      }
    },
    DashboardResize () {
      if (typeof (Event) === 'function') {
        // modern browsers
        window.dispatchEvent(new Event('resize'))
      } else {
        // old browsers and especially IE
        var resizeEvent = window.document.createEvent('UIEvents')
        resizeEvent.initUIEvent('resize', true, false, window, 0)
        window.dispatchEvent(resizeEvent)
      }
    }
  },
  computed: {
    ...mapGetters({
      getCustomization: 'getCurrentCustomization',
      globalFilters: 'getGlobalFilters'
    }),

    filteredFavorites () {
      if (this.filterFavorite === '') return this.favorites
      return this.favorites.filter(entry => {
        return entry.title.toLowerCase().includes(this.filterFavorite.toLowerCase())
      })
    },
    showFavorites () {
      var showFavoritesTab = true
      var customization = this.getCustomization || {}
      if (customization && customization.showfavorites !== 'undefined') {
        showFavoritesTab = customization.showfavorites
      }
      return showFavoritesTab
    },
    hasFilters () {
      var dashboardActive = this.dashboardId || null
      var hasGlobalFilters = this.globalFilters.filter(x => x.destination === 'sideBarFilter').map(y => y.schema.authorizations).filter(z => (z.includes(dashboardActive) || z.length === 0)).length > 0
      return hasGlobalFilters // almost 1 filter or the tab not appears.
    },
    hasTopBar () {
      return document.querySelector('div.subheader')
    },
    setHeight () {
      if (document.querySelector('.sidebarfilter')) {
        const scrollH = document.querySelector('.sidebarfilter').clientHeight - 300 + 'px'
        return { height: scrollH }
      } else {
        return { height: '1000px' }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.sidebarfilter {
  transition: width 0.2s ease;
  height: calc(100vh - 106px);
  background-color: var(--color-bg-primary);
  width: rem(48);
  border-right: 1px solid var(--color-border-hard-divisor);

  .ods-tabs {
    transition: opacity 0.2s ease;
    opacity: 0;
  }

  &--open {
    transition: width 0.2s ease;
    width: rem(350);

    .ods-tabs {
      transition: opacity 0.2s ease;
      opacity: 1;
    }
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__container {
    margin: 16px;
  }
}
.sidebarfilter-noTopBar {
  height: calc(100%);
  min-height: 100vh;
}

.sidebarScroll {
   height: 600px;
   border-radius: 8px;
   padding: 10px;
}

::v-deep .scrollbar-gadgetree {
  height: 1000px;
  overflow: scroll!important;
}
.gadgetFavorite {
    background-color: #2e6c99;
    padding: 4px 8px;
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
    display: block;
    align-items: center;
    margin-bottom: 4px;
    text-overflow: ellipsis;
    width: rem(175);
    overflow: hidden;
    padding-right: 10px;
}

::v-deep .ods-select__tags .ods-tag {
    max-width: calc(100% - 12px)!important;
}

::v-deep .ods-tree-node.is-parent:not(.is-children) {
  border-bottom: 1px solid #ccc;
  margin-bottom: rem(12);
  padding-bottom: rem(12);
}
</style>
