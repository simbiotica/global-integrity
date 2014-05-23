'use strict';

define([
  'underscore',
  'backbone',
  'sprintf',
  'models/answer',
  'text!../../queries/answers.pgsql'
], function(_, Backbone, sprintf, AnswerModel, sql) {

  sprintf = sprintf.sprintf;

  var AnswersCollection = Backbone.Collection.extend({

    model: AnswerModel,

    url: 'http://globalintegrity.cartodb.com/api/v2/sql',

    parse: function(data) {
      if (!this.categories) {
        var categories = _.uniq(_.reject(_.map(data.rows, function(d) {
          return {
            id: d.categoryid,
            name: d.categoryname
          };
        }), function(d) {
          return d.name === '';
        }), false, function(d) {
          return d.id;
        });

        this.categories = categories;
      }

      var result = _.reject(_.map(this.categories, function(category) {
        category.answers = _.where(data.rows, {
          categoryid: category.id
        });
        return category;
      }), function(r) {
        return r.answers.length === 0;
      });

      return result;
    },

    getData: function(params, callback) {
      var options, query;

      function onSuccess(collection) {
        if (callback && typeof callback === 'function') {
          callback(undefined, collection);
        }
      }

      function onError(collection, err) {
        if (callback && typeof callback === 'function') {
          callback(err);
        }
      }

      if (!params) {
        query = sprintf(sql, ' ');
      } else if (params.question !== 'all' && params.target !== 'all') {
        query = sprintf(sql, 'WHERE categoryid IN (\'' + Number(params.target) + '\') AND questionid IN (' + Number(params.question) + ')');
      } else if (params.question !== 'all' && params.target === 'all') {
        query = sprintf(sql, 'WHERE questionid IN (\'' + Number(params.question) + '\')');
      } else if (params.question === 'all' && params.target !== 'all') {
        query = sprintf(sql, 'WHERE categoryid IN (\'' + Number(params.target) + '\')');
      }

      options = {
        data: {
          q: query,
          format: 'json'
        },
        success: onSuccess,
        error: onError
      };

      this.fetch(options);
    }

  });

  return AnswersCollection;

});
