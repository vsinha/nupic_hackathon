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
   * Backbone.js Model for an AWS Metric
   * @author Brev Patterson <bpatterson@numenta.com>
   * @constructor
   * @copyright © 2014 Numenta
   * @public
   * @requires Backbone, Backbone.Model
   * @returns {Object} Backbone.Model object
   */
  GROKUI.AwsMetricModel = Backbone.Model.extend({

    // Backbone.Model properties

    // Custom properties

    // Backbone.Model methods

    /**
     * Backbone.Model.parse()
     */
    parse: function(response, options)  {
      var dimension = null;

      // pretty display name defaults
      if(
        ('name' in response) &&
        (response.name.length > 0)
      ) {
        response.display = response.name + ' (' + response.identifier + ')';
      }
      else {
        response.name = response.display = response.identifier;
      }

      if('dimensions' in response) {
        // rewrite dimensions a little so that model creator can use them
        Object.keys(response.dimensions).forEach(function(dimension) {
          if(typeof(response.dimensions[dimension]) === 'object') {
            response.dimensions[dimension] = response.dimensions[dimension][0];
          }
        });

        dimension = Object.keys(response.dimensions)[0];
        if(
          dimension &&
          dimension.match(this.collection.site.instances.types.autoscale)
        ) {
          // pretty display name - Grok Autostack
          response.display = response.name +
            ' (' + this.collection.site.instances.types.autoscale + ')';
        }
      }

      return response;
    }

    // Custom methods

  });

}());
