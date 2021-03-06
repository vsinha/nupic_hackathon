/* ----------------------------------------------------------------------
 *  Copyright © 2006-2014 Numenta Inc. All rights reserved.
 *
 *  The information and source code contained herein is the
 *  exclusive property of Numenta Inc. No part of this software
 *  may be used, reproduced, stored or distributed in any form,
 *  without explicit written authorization from Numenta Inc.
 * ---------------------------------------------------------------------- */

(function() {

  /**
   * Backbone.js Collection for a group of Grok Monitored Instances, from the
   *  the /_instances API endpoint.
   * @author Brev Patterson <bpatterson@numenta.com>
   * @constructor
   * @copyright © 2014 Numenta
   * @public
   * @requires Backbone.js, Grok InstanceModel class
   * @returns {Object} Backbone.js Collection object
   */
  GROKUI.InstancesCollection = Backbone.Collection.extend({

    // Backbone.Collection properties

    model: GROKUI.InstanceModel,

    // Custom properties

    api: null,
    site: null,
    intervalId: null,

    // Backbone.Collection methods

    initialize: function(models, options) {
      this.api = options.api;
      this.site = options.site;
    },

    /**
     * Custom override for Backbone.sync(), since we're using our own API
     *  library REST calls, and not going to let Backbone do XHR directly.
     */
    sync: function(method, collection, options) {
      var options = options || {},
          result = null;

      switch(method) {
        case 'create':
          break;

        case 'read':
          result = this.api.getMonitoredInstances(function(error, instances) {
            if(error) return options.error(error);
            return options.success(instances);
          });
          break;

        case 'update':
          break;

        case 'delete':
          break;
      }

      return result;
    }

    // Custom methods

  });

}());
