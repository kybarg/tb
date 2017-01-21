(function () {
  'use strict';

  angular
    .module('core')
    .config(function ($provide) {
      // this demonstrates how to register a new tool and add it to the default toolbar
      $provide.decorator('taOptions', ['taRegisterTool', '$delegate', function (taRegisterTool, taOptions) {

        taRegisterTool('fontStyle', {
          display: '<span name="html"><md-menu md-offset="-24 -12">' +
            '<md-button class="md-textangular-button" aria-label="Font style" ng-click="$mdOpenMenu($event)" ng-disabled="isButtonDisabled(\'on\')">' +
            '<md-icon md-menu-origin>text_fields</md-icon>' +
            '<md-icon md-menu-origin>arrow_drop_down</md-icon>' +
            '</md-button>' +
            '<md-menu-content width="4">' +
            '<md-menu-item ng-repeat="o in options">' +
            '<md-button ng-click="action(o)"><span class="{{o.value}}">{{o.name}}</span></md-button>' +
            '</md-menu-item>' +
            '</md-menu-content>' +
            '</md-menu></span>',
          action: function (o) {
            if (typeof o.value !== 'undefined')
              return this.$parent.$editor().wrapSelection('formatBlock', '<' + o.value + '>');
          },
          isButtonDisabled: function() {
            // to set your own disabled logic set a function or boolean on the tool called 'disabled'
            return ( // this bracket is important as without it it just returns the first bracket and ignores the rest
              // when the button's disabled function/value evaluates to true
              (typeof this.$eval('disabled') !== 'function' && this.$eval('disabled')) || this.$eval('disabled()') ||
              // all buttons except the HTML Switch button should be disabled in the showHtml (RAW html) mode
              (this.name !== 'html' && this.$parent.$editor().showHtml) ||
              // if the toolbar is disabled
              this.$parent.$parent.disabled ||
              // if the current editor is disabled
              this.$parent.$editor().disabled
            );
          },
          // activeState: function (q) {
          //   return function () {
          //     return this.$parent.$editor().queryFormatBlockState(q);
          //   }
          // },
          options: [{
            name: 'Header 1',
            value: 'h1'
          }, {
            name: 'Header 2',
            value: 'h2'
          }, {
            name: 'Header 3',
            value: 'h3'
          }, {
            name: 'Header 4',
            value: 'h4'
          }, {
            name: 'Header 5',
            value: 'h5'
          }, {
            name: 'Header 6',
            value: 'h6'
          }, {
            name: 'Paragraph',
            value: 'p'
          }, {
            name: 'Code',
            value: 'pre'
          }, {
            name: 'Quote',
            value: 'blockquote'
          }]
        });

        // $delegate is the taOptions we are decorating
        // here we override the default toolbars and classes specified in taOptions.
        taOptions.forceTextAngularSanitize = true; // set false to allow the textAngular-sanitize provider to be replaced
        taOptions.keyMappings = []; // allow customizable keyMappings for specialized key boards or languages
        taOptions.toolbar = [
          // ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote'],
          ['fontStyle', 'bold', 'italics', 'underline'],
          ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'],
          ['ul', 'ol', 'redo', 'undo', 'clear'],
          ['insertImage', 'insertLink', 'html']
          // , ['wordcount', 'charcount']
        ];
        taOptions.classes = {
          focussed: 'focussed',
          toolbar: 'md-toolbar layout-row layout-wrap layout-align-start-center',
          toolbarGroup: 'md-toolbar-tools',
          toolbarButton: 'md-textangular-button',
          toolbarButtonActive: 'active',
          disabled: 'disabled',
          textEditor: 'form-control',
          htmlEditor: 'form-control'
        };
        return taOptions; // whatever you return will be the taOptions
      }]);
      // this demonstrates changing the classes of the icons for the tools for font-awesome v3.x
      $provide.decorator('taTools', ['$delegate', function (taTools) {
        taTools.fontStyle.class = '';

        taTools.quote.display = '<md-button><md-icon>format_quote</md-icon></md-button>';

        taTools.bold.display = '<md-button><md-icon>format_bold</md-icon></md-button>';
        taTools.italics.display = '<md-button><md-icon>format_italic</md-icon></md-button>';
        taTools.underline.display = '<md-button><md-icon>format_underlines</md-icon></md-button>';

        taTools.ul.display = '<md-button><md-icon>format_list_bulleted</md-icon></md-button>';
        taTools.ol.display = '<md-button><md-icon>format_list_numbered</md-icon></md-button>';

        taTools.undo.display = '<md-button><md-icon>undo</md-icon></md-button>';
        taTools.redo.display = '<md-button><md-icon>redo</md-icon></md-button>';

        taTools.clear.display = '<md-button><md-icon>format_clear</md-icon></md-button>';

        taTools.justifyLeft.display = '<md-button><md-icon>format_align_left</md-icon></md-button>';
        taTools.justifyRight.display = '<md-button><md-icon>format_align_right</md-icon></md-button>';
        taTools.justifyCenter.display = '<md-button><md-icon>format_align_center</md-icon></md-button>';
        taTools.justifyFull.display = '<md-button><md-icon>format_align_justify</md-icon></md-button>';

        taTools.insertLink.display = '<md-button><md-icon>insert_link</md-icon></md-button>';
        // taTools.unlink.iconclass = 'icon-link red';
        taTools.html.display = '<md-button><md-icon>code</md-icon></md-button>';
        taTools.insertImage.display = '<md-button><md-icon>insert_photo</md-icon></md-button>';

        taTools.insertImage.display = '<md-button><md-icon>insert_photo</md-icon></md-button>';

        return taTools;
      }]);
    });
}());
