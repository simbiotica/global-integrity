'use strict';

require.config({

  paths: {
    jquery: '../vendor/jquery/dist/jquery',
    underscore: '../vendor/underscore/underscore',
    backbone: '../vendor/backbone/backbone',
    handlebars: '../vendor/handlebars/handlebars',
    text: '../vendor/requirejs-text/text',
    sprintf: '../vendor/sprintf/src/sprintf',
    select2: '../vendor/select2/select2',
    _string: '../vendor/underscore.string/dist/underscore.string.min'
  },

  shim: {
    jquery: {
      exports: '$'
    },
    underscore: {
      exports: '_'
    },
    backbone: {
      deps: ['jquery', 'underscore'],
      exports: 'Backbone'
    },
    handlebars: {
      exports: 'Handlebars'
    },
    sprintf: {
      exports: 'sprintf'
    },
    select2: {
      deps: ['jquery'],
      exports: '$'
    },
    _string: {
      deps: ['underscore'],
      exports: '_'
    }
  }

});

require([
  'views/toolbar',
  'views/result'
], function(ToolbarView, ResultView) {

  // Extensions
  Number.prototype.toCommas = function() {
    return this.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  document.getElementById('printBtn').onclick = function() {
    window.print();
  };

  new ToolbarView();
  new ResultView();

});
