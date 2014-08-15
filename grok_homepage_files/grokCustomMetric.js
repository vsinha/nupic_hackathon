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
   * Backbone.js Model for a single Grok Custom Metric
   * @author Brev Patterson <bpatterson@numenta.com>
   * @constructor
   * @copyright © 2014 Numenta
   * @public
   * @requires Backbone.js
   * @returns {Object} Backbone.js Model object
   */
  GROKUI.GrokCustomMetricModel = Backbone.Model.extend({

    // Backbone.Model properties

    // Custom properties

    // Backbone.Model methods

    /**
     * Backbone.Model.parse()
     */
    parse: function(response, options) {
      // rewrite dimensions a little so that model creator can use them
      if('dimensions' in response) {
        Object.keys(response.dimensions).forEach(function(dimension) {
          if(typeof(response.dimensions[dimension]) === 'object') {
            response.dimensions[dimension] = response.dimensions[dimension][0];
          }
        });
      }

      return response;
    }

    // Custom methods

  });

}());
