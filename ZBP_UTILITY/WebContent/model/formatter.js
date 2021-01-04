sap.ui.define([], function () {
	"use strict";
	return {
		formatNumber: function (iAccount) {
			if(iAccount) {
			  return parseInt(iAccount);
			}
		}	
	};
});