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
   * Backbone.js Collection for a group of AWS Regions
   * @author Brev Patterson <bpatterson@numenta.com>
   * @constructor
   * @copyright © 2014 Numenta
   * @public
   * @requires Backbone.js, Grok AwsRegionModel class
   * @returns {Object} Backbone.js Collection object
   */
  GROKUI.AwsRegionsCollection = Backbone.Collection.extend({

    // Backbone.Collection properties

    model: GROKUI.AwsRegionModel,

    // Custom properties

    api: null,

    // Backbone.Collection methods

    /**
     *
     */
    initialize: function(models, options) {
      this.api = options.api;
    },

    /**
     * Handle the fetch/sync response, repack to Backbone.Model format
     * @returns {Array} List of Backbone.Model objects to create
     */
    parse: function(regions) {
      var result = Object.keys(regions).sort().map(function(region) {
        var name = regions[region].replace(' Region', ''),
            display = '<strong>' + region + '</strong>: ' + name,
            model = {
              id:   region,
              name: display
            };

        return model;
      });

      return result;
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
          result = this.api.getRegions(function(error, regions) {
            if(error) return options.error(error);
            return options.success(regions);
          });
          break;

        case 'update':
          break;

        case 'delete':
          break;
      }

      return result;
    }

  });

}());
