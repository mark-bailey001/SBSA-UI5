sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "ZBP_UTILITY/model/formatter",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator"
 
], function (Controller, JSONModel, formatter, Filter, FilterOperator) {
  "use strict";
  
  return Controller.extend("zbp_utility.main", {

	        
	  		// set the formatter
	    	formatter: formatter,
	  
	        /**
			 * Called when a controller is instantiated and its View controls
			 * (if available) are already created. Can be used to modify the
			 * View before it is displayed, to bind event handlers and do other
			 * one-time initialization.
			 * 
			 * @memberOf zbp_utility.main
			 */
	
	  
			onInit: function() {
				//this.call_ModelFile();
			},
			/**
			 * Similar to onAfterRendering, but this hook is invoked before the
			 * controller's View is re-rendered (NOT before the first rendering!
			 * onInit() is used for that one!).
			 * 
			 * @memberOf zbp_utility.main
			 */
			// onBeforeRendering: function() {
			//
			// },
			/**
			 * Called when the View has been rendered (so its HTML is part of
			 * the document). Post-rendering manipulations of the HTML could be
			 * done here. This hook is the same one that SAPUI5 controls get
			 * after being rendered.
			 * 
			 * @memberOf zbp_utility.main
			 */
			// onAfterRendering: function() {
			//
			// },
			/**
			 * Called when the Controller is destroyed. Use this one to free
			 * resources and finalize activities.
			 * 
			 * @memberOf zbp_utility.main
			 */
			// onExit: function() {
			//
			// },
			pressNextPage : function(evt) {
				// Navigation to detail page
				var context = evt.getSource().getBindingContext();
				this.nav.to("Details", context); // to() is defined in
													// 'App.controller.js'
			},

			pressGetBPInfo : function(evt) {
				this.call_ModelFile();
			},
			
			onPressEditMain : function(evt) {
				this.getView().byId("riskScore").setEditable(true);
				this.getView().byId("mainCancel").setEnabled(true);
				this.getView().byId("mainEdit").setEnabled(false);
			},
			
			onPressCancelMain : function(evt) {
				this.getView().byId("riskScore").setEditable(false);
				this.getView().byId("mainEdit").setEnabled(true);
				this.getView().byId("mainCancel").setEnabled(false);
				
/*				var riskScore = oModelOld.getProperty("/output/mainInfo/riskRating/riskScore");
				var riskLevel = oModelOld.getProperty("/output/mainInfo/riskRating/riskLevel");
				this.getView().byId("riskScore").setValue(riskScore);
				this.getView().byId("riskLevel").setText(riskLevel);*/
				
			},
			
			onPressSave : function(evt) {
				var newModel = new sap.ui.model.json.JSONModel();
				var aData = [];
				var aStubData = [];
				var riskScore = this.getView().byId("riskScore").getValue();
				var bpID = this.getView().byId("bpInput").getValue();
				if(!bpID) {
					sap.m.MessageToast.show("Please Enter a valid BP ID");
					return;
				}
				//Get Risk Indicator Data
				var oTable = this.getView().byId('idRiskTable');
				for (var i = 0; i < oTable.getItems().length; i++){
				    var oProperty = this.getView().getModel().getProperty(oTable.getItems()[i].getBindingContext().getPath());
				    var itemRow = {riskInd: oProperty.riskInd, status: oProperty.status};
				    aData.push(itemRow);
				}
				//Get Credit Stub Data
				var oStubTable = this.getView().byId('idStubHeaderTable');
				for (var i = 0; i < oStubTable.getItems().length; i++){
				    var oProperty = this.getView().getModel().getProperty(oStubTable.getItems()[i].getBindingContext().getPath());
				    var itemRow = {partner: oProperty.partner, processType: oProperty.processType, stage: oProperty.stage, product: oProperty.product,
				                   ncaInd: oProperty.ncaInd, credStub: oProperty.credStub};
				    aStubData.push(itemRow);
				}
				var aChangeInfo = {
						            riskScore : "",
	        			       		bpRiskInd : [
	        			       		{}
	        			       		],
	        			       		bpCreditStub : [
	        			       		{}	
	        			       		]
			        			  };
				aChangeInfo["riskScore"] = riskScore;
				aChangeInfo["bpRiskInd"] = aData;
				aChangeInfo["bpCreditStub"] = aStubData;
				newModel.setData(aChangeInfo);
				
				var oBusyDialog_Global = new sap.m.BusyDialog();
				oBusyDialog_Global.open();
	        	
				var sUrl = "http://s1c7na2z.standardbank.co.za:8002/sbsa/ao/700/utilities/" + bpID;
				//var sUrl = "http://d1sapa1z.standardbank.co.za:8015/sbsa/ao/715/utilities/" + bpID;
			    var aData = $.ajax({
			        type : "PUT",
			        contentType : "application/json",
			        url : sUrl,
			        dataType : "json",
			        data: JSON.stringify(aChangeInfo),
			        accepts: {
			            text: "application/json"
			        },
			        async: true,
			        success: function(odata, textStatus, XMLHttpRequest) {
			        	//alert("Success Put");
			        	oBusyDialog_Global.close();
			        	sap.m.MessageToast.show("Successfully saved Risk/Credit Stub Info");
			       	},
		           	error: function() {
		           		oBusyDialog_Global.close();
		           		sap.m.MessageToast.show("Error trying to Save Risk/Credit Stub Info");
		           	} });
										
			},
			
			onChangeRiskScore : function(evt) {
				var riskScore = this.getView().byId("riskScore").getValue();
				if (riskScore >= 0 && riskScore < 40) {
					this.getView().byId("riskLevel").setText("Low");
			    }

				if (riskScore >= 40 && riskScore < 70) {
					this.getView().byId("riskLevel").setText("Medium");
			    }

				if (riskScore >= 70) {
					this.getView().byId("riskLevel").setText("High");
			    }
			},

			call_ModelFile : function() {

				//Set JSONModeloutput to ListControl
				// Calling model json file for data reference
/*				var sample = $.sap.getModulePath("ZBP_UTILITY","/model/sampleData4.json");
				var oModel = new sap.ui.model.json.JSONModel(sample);
				var oModelOld = new sap.ui.model.json.JSONModel(sample);
				oModel.loadData(sample, "", false);
				
				this.getView().setModel(oModel);
				sap.ui.getCore().setModel(oModel);
				oModelOld.loadData();*/
				

				
				var bpID = this.getView().byId("bpInput").getValue();
				if(!bpID) {
					sap.m.MessageToast.show("Please Enter a valid BP ID");
					return;
				}
				//var sUrl = "http://d1sapa1z.standardbank.co.za:8015/sbsa/ao/715/utilities/" + bpID;
				var sUrl = "http://s1c7na2z.standardbank.co.za:8002/sbsa/ao/700/utilities/" + bpID;
				
				var oBusyDialog_Global = new sap.m.BusyDialog();
				oBusyDialog_Global.open();
				var actimizeMessage = this.getView().byId("idActimizeMessage");
				var oModelServer = new sap.ui.model.json.JSONModel();
		        var aData = jQuery.ajax({
		            type : "GET",
		            contentType : "application/json",
		            url : sUrl,
		            dataType : "json",
		            accepts: {
		                text: "application/json"
		            },
		            async: true,
		            success : function(data,textStatus, jqXHR) {
		                oModelServer.setData(data); 
		                oBusyDialog_Global.close();
		                var actimizeStatus = data.output.mainInfo.actimizeStatus;
		                actimizeMessage.setVisible(true);
						if(actimizeStatus=="TRUE") {
							actimizeMessage.setText("Actimize Service is up and running");
							actimizeMessage.addStyleClass("TextGreenBold");
						} else {
							actimizeMessage.setText("Actimize Service is currently down");
							actimizeMessage.addStyleClass("TextRedBold");
						}
		                //alert("success to get BP info");		                
		            },
		            error : function(err) {
		            	oBusyDialog_Global.close();
		            	sap.m.MessageToast.show("Error in Get -- Request "+ request +"Response" + response);
		            }

		        });
				
		        this.getView().setModel(oModelServer);
		        sap.ui.getCore().setModel(oModelServer);

			},
			
			onPressGetQuotes : function() {
/*				var sample = $.sap.getModulePath("ZBP_UTILITY","/model/sampleQuotes.json");
				var oModelOpps = new sap.ui.model.json.JSONModel(sample);*/
				
				var oBusyDialog_Global = new sap.m.BusyDialog();
				oBusyDialog_Global.open();
				var bpID = this.getView().byId("bpInput").getValue();
				var sUrl = "http://s1c7na2z.standardbank.co.za:8002/sbsa/ao/700/quotes?statuses=[I1002]&partner=" + bpID;
				//var sUrl = "http://d1sapa1z.standardbank.co.za:8015/sbsa/ao/715/quotes?statuses=[I1002]&partner=" + bpID;
				
				var oModelOpps = new sap.ui.model.json.JSONModel();
		        var aData = jQuery.ajax({
		            type : "GET",
		            contentType : "application/json",
		            url : sUrl,
		            dataType : "json",
		            accepts: {
		                text: "application/json"
		            },
		            async: true,
		            success : function(data,textStatus, jqXHR) {
		            	oBusyDialog_Global.close();
		            	oModelOpps.setData(data); 
		            },
		            error: function() {
		            	oBusyDialog_Global.close();
		            	sap.m.MessageToast.show("Error in Get -- Request "+ request +"Response" + response);
	            	}
		        });    
				this.getView().byId("idQuotes").setModel(oModelOpps);
				this.getView().byId('idQuoteExpire').setEnabled(false);
            	this.getView().byId("idQuoteItemsTable").getModel().refresh(true);
	        	this.getView().byId("idQuoteItemsTable").setHeaderText("Items");
						
			},
			
			onPressOpportID : function (oEvent) {
				var oSelectedItem = oEvent.getSource().getParent();
				var oBindingContext = oSelectedItem.getBindingContext();
				this.getView().byId("idQuoteItemsTable").setBindingContext(oBindingContext);
				var sOppID = parseInt(oBindingContext.getProperty("opportId"));
				var sItemsText = 'Items: ' + sOppID;
				this.getView().byId("idQuoteItemsTable").setHeaderText(sItemsText);
			},
			
			onPressExpireQuotes : function (oEvent) {
				var oTable = this.getView().byId('idQuoteHeaderTable');
				var aExpire = [];
				for (var i = 0; i < oTable.getItems().length; i++){
				    var sOppID = oTable.getItems()[i].getCells()[0].getText();
					var bCheckBoxExpire = oTable.getItems()[i].getCells()[4].getSelected();
					if(bCheckBoxExpire==true) {
						aExpire.push(sOppID);
					}
				}
				this.call_ExpireQuotes(aExpire);
	        },
			
	        onExpireChkBoxSelect : function (oEvent) {
				var oTable = this.getView().byId('idQuoteHeaderTable');
				var activateExpireButton=false;
				for (var i = 0; i < oTable.getItems().length; i++){
				    var bCheckBoxExpire = oTable.getItems()[i].getCells()[4].getSelected();
				    if(bCheckBoxExpire==true) {
				    	activateExpireButton=true;
				    	
				    }
				}
				this.getView().byId('idQuoteExpire').setEnabled(activateExpireButton);
	        },
	        
	        call_ExpireQuotes : function(aExpQuotes) {
	        	var oModelQuote = new sap.ui.model.json.JSONModel();
	        	
	        	var data = {
	        			input : {
		        		status: "E0010",
		        		statusProf : "ZCJH0001"
		        		}
	        		};
	        	oModelQuote.setData(data);     	
	        	var oBusyDialog_Global = new sap.m.BusyDialog();
				oBusyDialog_Global.open();
	        	for (var i = 0; i < aExpQuotes.length; i++){
				    var sOppID = aExpQuotes[i];
				    var sUrl = "http://s1c7na2z.standardbank.co.za:8002/sbsa/ao/700/offers/" + sOppID + "/status";
				    //var sUrl = "http://d1sapa1z.standardbank.co.za:8015/sbsa/ao/715/offers/" + sOppID + "/status";
			        var aData = $.ajax({
			            type : "PUT",
			            contentType : "application/json",
			            url : sUrl,
			            dataType : "json",
			            data: JSON.stringify(data),
			            accepts: {
			                text: "application/json"
			            },
			            async: false,
			            success: function(odata, textStatus, XMLHttpRequest) {
			            	//alert("Success Put");
			            	oBusyDialog_Global.close();
		            	},
		            	error: function() {
		            		oBusyDialog_Global.close();
		            		sap.m.MessageToast.show("Error trying to Expire Quote "+ sOppID +"Response" + response);
		            	} });
				}
	        	this.onPressGetQuotes();            		        		        	
			},
			
			onPressGetOffers : function() {
/*				var sample = $.sap.getModulePath("ZBP_UTILITY","/model/sampleOffers.json");
				var oModelOffers = new sap.ui.model.json.JSONModel(sample);*/
								
				var oBusyDialog_Global = new sap.m.BusyDialog();
				oBusyDialog_Global.open();
				var bpID = this.getView().byId("bpInput").getValue();
				var sUrl = "http://s1c7na2z.standardbank.co.za:8002/sbsa/ao/700/partners/" + bpID + "/findApps?prodid=ZBRW";
				//var sUrl = "http://d1sapa1z.standardbank.co.za:8015/sbsa/ao/715/partners/" + bpID + "/findApps?prodid=ZBRW";
								
				var oModelOffers = new sap.ui.model.json.JSONModel();
				var aData = jQuery.ajax({
					            type : "GET",
					            contentType : "application/json",
					            url : sUrl,
					            dataType : "json",
					            accepts: {
					                text: "application/json"
					            },
					            async: true,
					            success : function(data,textStatus, jqXHR) {
					            	oBusyDialog_Global.close();
					            	oModelOffers.setData(data); 
					            },
					            error: function() {
					            	oBusyDialog_Global.close();
					            	sap.m.MessageToast.show("Error in Get -- Request "+ request +"Response" + response);
				            	}
					        });    
				
				this.getView().byId("idOffers").setModel(oModelOffers);
				this.getView().byId('idOfferExpire').setEnabled(false);
													
			},
			
			onExpireOfferChkBoxSelect : function (oEvent) {
				var oTable = this.getView().byId('idOfferHeaderTable');
				var activateExpireButton=false;
				for (var i = 0; i < oTable.getItems().length; i++){
				    var bCheckBoxExpire = oTable.getItems()[i].getCells()[6].getSelected();
				    if(bCheckBoxExpire==true) {
				    	activateExpireButton=true;
				    	
				    }
				}
				this.getView().byId('idOfferExpire').setEnabled(activateExpireButton);
	        },
			
	        onPressExpireOffers : function (oEvent) {
				var oTable = this.getView().byId('idOfferHeaderTable');
				var aExpire = [];
				for (var i = 0; i < oTable.getItems().length; i++){
				    var sOfferID = oTable.getItems()[i].getCells()[0].getText();
				    var sProdID  = oTable.getItems()[i].getCells()[1].getText();
				    var itemRow = {offerId: sOfferID, prodId: sProdID};
					var bCheckBoxExpire = oTable.getItems()[i].getCells()[6].getSelected();
					if(bCheckBoxExpire==true) {
						aExpire.push(itemRow);
					}
				}
				this.call_ExpireOffers(aExpire);
	        },
	        
	        call_ExpireOffers : function(aExpOffers) {
	        	var oModelOffer = new sap.ui.model.json.JSONModel();
	        	
	        	var data = {
	        			input : {
		        		status: "E0022",
		        		statusProf : "ZRPM0001"
		        		}
	        		};
	        	oModelOffer.setData(data);     	
	        	var oBusyDialog_Global = new sap.m.BusyDialog();
				oBusyDialog_Global.open();
	        	for (var i = 0; i < aExpOffers.length; i++){
				    var sOfferID = aExpOffers[i].offerId;
				    var sProdId  = aExpOffers[i].prodId;
				    if(sProdId=="BRCP") {
				    	data.input.statusProf = "ZRPO0001";
				    }
				    var sUrl = "http://s1c7na2z.standardbank.co.za:8002/sbsa/ao/700/offers/" + sOfferID + "/status";
				    //var sUrl = "http://d1sapa1z.standardbank.co.za:8015/sbsa/ao/715/offers/" + sOfferID + "/status";
			        var aData = $.ajax({
			            type : "PUT",
			            contentType : "application/json",
			            url : sUrl,
			            dataType : "json",
			            data: JSON.stringify(data),
			            accepts: {
			                text: "application/json"
			            },
			            async: false,
			            success: function(odata, textStatus, XMLHttpRequest) {
			            	//alert("Success Put");
			            	oBusyDialog_Global.close();
		            	},
		            	error: function() {
		            		oBusyDialog_Global.close();
		            		sap.m.MessageToast.show("Error trying to Expire Quote "+ sOppID +"Response" + response);
		            	} });
				}
	        	this.onPressGetOffers();            		        		        	
			},
	        
			onPressRelFilter: function () {
				//onClick of Filter Button write this below code
				var filterText = this.getView().byId("idFilterRelBP").getText();
				if(filterText=="Show Active") {
					var searchString = "9999-12-31";
					this.getView().byId("idFilterRelBP").setText("Show All");
					var filters = new sap.ui.model.Filter("dateTo", sap.ui.model.FilterOperator.EQ, searchString);
				} else {
					var searchString = "1900-01-01";
					this.getView().byId("idFilterRelBP").setText("Show Active");
					var filters = new sap.ui.model.Filter("dateFrom", sap.ui.model.FilterOperator.GT, searchString);
				}
				
				// update list binding
				this.getView().byId("idBPRelationsTable").getBinding("items").filter(filters);
			},
				        
			handleTableSelectDialogPress: function (oEvent) {
				 // get selected data from table (reference of table)
			      var oSelectedItem = oEvent.getSource().getParent();
				  var oBindingContext = oSelectedItem.getBindingContext();
			      var path = oBindingContext.getPath();
			    //var test = oBindingContext.oModel.getProperty(oBindingContext.sPath);
			    //var persnoVal = oTable.getSelectedItem().getBindingContext().getProperty("PersNo");
               //var firstnameVal = oTable.getSelectedItem().getBindingContext().getProperty("FirstName");
               //var lastnameVal = oTable.getSelectedItem().getBindingContext().getProperty("LastName");
               //var deptVal = oTable.getSelectedItem().getBindingContext().getProperty("Department");   
               //var eMail = oTable.getSelectedItem().getBindingContext().getProperty("EMail");
               // get the fragment
			      if (!this.oDialog) {
			    	  this.oDialog = sap.ui.xmlfragment("idFragment","zbp_utility.dialog", this);
			        }
			        this.oDialog.setBindingContext(oBindingContext);
			        this.oDialog.open();
            
               // get the reference of input fields of fragment and set the values
               //sap.ui.getCore().byId("idFragment--idPersNo").setValue(persnoVal);
               //sap.ui.getCore().byId("idFragment--idFirstName").setValue(firstnameVal);
               //sap.ui.getCore().byId("idFragment--idLastName").setValue(lastnameVal);
               //sap.ui.getCore().byId("idFragment--idDepartment").setValue(deptVal);               
               //sap.ui.getCore().byId("idFragment--idEMail").setValue(eMail);
           },
           
           onPressCreateQuote: function(oEvent) {
     	   
			   if (!this.oDialogQuote) {
			   	  this.oDialogQuote = sap.ui.xmlfragment("idQuoteFragment","zbp_utility.quote", this);
			   }
				   
			   //Loop through Accounts in ProductPortfolio and populate Accounts Select DropDownBox
			   var oModel = this.getView().getModel();
			   var accounts = oModel.getProperty("/output/bpAccounts");
			   var selectListAccounts = [];
			   var quoteModel = new sap.ui.model.json.JSONModel();
				
			   if(accounts) {
			     for (var i = 0; i < accounts.length; i++){
				     var systemId  = accounts[i].systemId;
    			     var accountId = accounts[i].accountId;
				     var productId = accounts[i].accountProductId;
				     var status    = accounts[i].accountStatus;
				     var productId = accounts[i].accountProductId;
				     if( (productId == "0161") || (productId == "4477") || (productId == "4478") || (productId == "4648") &&
					     (status == "E0004") ) {
					     var itemRow = {systemId: systemId, 
						                accountId: accountId,
							   		    productId: productId};
				         selectListAccounts.push(itemRow);
				     } 
			     }
			   }  
			     
			   var aChangeInfo = {
					   				Accounts : [
					   				{}
					   				],
	        			       		RelatedParties : [
	        			       		{}
	        			       		],
	        			       		DeliveryMethods : [
		        			       	{}
		        			       	]
			   };
			   if(selectListAccounts) {
			     aChangeInfo["Accounts"] = selectListAccounts;
			   }  
			   
			 //Loop through Related Parties and populate Related Parties Select DropDownBox
			   var relatedParties = oModel.getProperty("/output/bpRelations");
			   var selectListRelatedParties = [];
			   var entityType = oModel.getProperty("/output/mainInfo/legalEnty");

			   if(relatedParties) {
			     for (var i = 0; i < relatedParties.length; i++){
				     var relType   = relatedParties[i].relType;
				     var partner   = relatedParties[i].partner;
				     var name      = relatedParties[i].partnerName;
				     var dateTo    = relatedParties[i].dateTo;
				   
				     // Sole Proprietor
				     if( (entityType=="ZL") && (relType == "ZSOLEP") && (dateTo == "9999-12-31") ) {
					     var itemRow = {bpId: partner, 
						  	   		    name: name};
				         selectListRelatedParties.push(itemRow);
				     }
				   
				     // Close Corporation
				     if( (entityType=="01") && (relType == "ZMEMBE") && (dateTo == "9999-12-31") ) {
					     var itemRow = {bpId: partner, 
							   		    name: name};
				         selectListRelatedParties.push(itemRow);
				     }
				   
				     // Private Company
				     if( (entityType=="07") && (relType == "ZDIREC") && (dateTo == "9999-12-31") ) {
					     var itemRow = {bpId: partner, 
						  	   		    name: name};
				         selectListRelatedParties.push(itemRow);
				     }
			     }
			   }  
			   if(selectListRelatedParties) {
			     aChangeInfo["RelatedParties"] = selectListRelatedParties;
			   }
			     
			   // Delivery Methods
			   var selectListDeliveryMethods = [];
			   var itemRow = {code: "ZHND", 
				   		      desc: "Hand Delivery"};
			   selectListDeliveryMethods.push(itemRow);
			   itemRow = {code: "ZRGM", 
			   		      desc: "Registered Mail"};
		       selectListDeliveryMethods.push(itemRow);
		       itemRow = {code: "ZNKN", 
			   		      desc: "Not Known"};
		       selectListDeliveryMethods.push(itemRow);
		       aChangeInfo["DeliveryMethods"] = selectListDeliveryMethods;       
			   
			   
			   // Add data to Model and bind Model to oDialog Object
			   quoteModel.setData(aChangeInfo);
			   this.oDialogQuote.setModel(quoteModel);
			   this.oDialogQuote.open();
           },
           
           onPressQuoteCancel: function(oEvent){
               //var oDialogQuote = oEvent.getSource().getParent();
               this.oDialogQuote.close();
           },
           
           onPressQuoteSave: function(oEvent){
               var oModelQuote   = this.oDialogQuote.getModel();
               var oModelMain    = this.getView().getModel();
               var partner       = oModelMain.getProperty("/output/mainInfo/partner");
               var selProductId  = sap.ui.core.Fragment.byId("idQuoteFragment", "productSelect").getSelectedKey();
        	   var minLimit      = sap.ui.core.Fragment.byId("idQuoteFragment", "idMinLimit").getValue();
               var maxLimit      = sap.ui.core.Fragment.byId("idQuoteFragment", "idMaxLimit").getValue();
               var interest      = sap.ui.core.Fragment.byId("idQuoteFragment", "idInterest").getValue();
               var term          = sap.ui.core.Fragment.byId("idQuoteFragment", "idCreditTerm").getText();
               var selectedItem  = sap.ui.core.Fragment.byId("idQuoteFragment", "accountSelect").getSelectedItem();
               var accountStr    = selectedItem.getText();
               if( (accountStr) && (selProductId == "ZAOD") ) {
                 var srcAcc        = accountStr.split("-");
                 var sourceId      = srcAcc[0].trim();
                 var accountId     = srcAcc[1].trim();
               }  
               var relParty      = sap.ui.core.Fragment.byId("idQuoteFragment", "partiesSelect").getSelectedKey();
               var income        = sap.ui.core.Fragment.byId("idQuoteFragment", "idIncome").getValue();
               var expense       = sap.ui.core.Fragment.byId("idQuoteFragment", "idExpense").getValue();
               var assets        = sap.ui.core.Fragment.byId("idQuoteFragment", "idAssets").getValue();
               var liabilities   = sap.ui.core.Fragment.byId("idQuoteFragment", "idLiabilities").getValue();
               var turnover      = sap.ui.core.Fragment.byId("idQuoteFragment", "idTurnover").getValue();
               var EntityExp     = sap.ui.core.Fragment.byId("idQuoteFragment", "idEntityExpense").getValue();
               var EntityAssets      = sap.ui.core.Fragment.byId("idQuoteFragment", "idEntityAssets").getValue();
               var EntityLiabilities = sap.ui.core.Fragment.byId("idQuoteFragment", "idEntityLiabilities").getValue();
               var deliveryMethod    = sap.ui.core.Fragment.byId("idQuoteFragment", "deliverySelect").getSelectedKey();
               
               // Get Product Code
               if(selProductId == "ZAOD") {
                 var accounts = oModelQuote.getProperty("/Accounts");
                 if(accounts) {
                   for (var i = 0; i < accounts.length; i++){
				       var accSourceId   = accounts[i].systemId;
				       var accAccountId  = accounts[i].accountId;
				       var accProductId  = accounts[i].productId;
				   				   
				       // Get Product ID
				       if( (accSourceId == sourceId) && (accAccountId == accountId) ) {
					       var productId = accProductId;
				       }
                   } 
                 }
               } else {
                  var productId = selProductId;   
               }
               
               var oData = {
            		   "partner" : partner,
            		   "maxMonthRepay" : "0",
            		   "channel" : "Z002",
            		   "income" : turnover,
            		   "expense" : EntityExp,
            		   "products" : [
            		     {
            		       "productCode" : productId,
            		       "decisionCode" : "A",
            		       "declineCod1" : "AA01",
            		       "declineCod2" : "",
            		       "declineCod3" : "",
            		       "declineCod4" : "",
            		       "declineCod5" : "",
            		       "declineCod6" : "",
            		       "declineCod7" : "",
            		       "declineCod8" : "",
            		       "declineCod9" : "",
            		       "declineCod10" : "",
            		       "overrideInd" : "N",
            		       "maxLimAmnt" : maxLimit,
            		       "minLimAmnt" : minLimit,
            		       "maxTermMonths" : term,
            		       "minTermMonths" : term,
            		       "totInterestRate" : interest,
            		       "ccProduct" : {
            		         "creditCategory" : "",
            		         "accountNumber" : "",
            		         "systemId" : "",
            		         "creditProduct" : ""
            		       },
            		       "existingAccount" : {
            		         "systemId" : sourceId,
            		         "accountNum" : accountId
            		       },
            		       "pricing" : {
            		         "condType" : "",
            		         "condAmt" : "0"
            		       },
            		       "planType" : ""
            		     }
            		   ],
            		   "coiDetails" : {
            		     "accNo" : "",
            		     "accIbt" : "",
            		     "accSourceSys" : "",
            		     "lastSalDate" : "",
            		     "incMthEst" : "0",
            		     "incPayFrequency" : "",
            		     "incPayDay" : ""
            		   },
            		   "relatedPartyInfo" : [
            		     {
            		       "partnerId" : relParty,
            		       "reltype" : "",
            		       "relnr" : "",
            		       "income" : [
            		         {
            		           "incomeType" : "I1",
            		           "incomeDesc" : "Gross Income/Wages",
            		           "incomeAmt" : income,
            		           "incomeFreq" : "4",
            		           "incomeFreqText" : "Monthly"
            		         }
            		       ],
            		       "expenses" : [
            		         {
            		           "expenseType" : "E1",
            		           "expenseDesc" : "Total Expenses",
            		           "expenseAmt" : expense,
            		           "expenseFreq" : "4",
            		           "expenseFreqText" : "Monthly"
            		         }
            		       ],
            		       "assets" : [
            		         {
            		           "assetType" : "A1",
            		           "assetDesc" : "Total Assets",
            		           "assetAmt" : assets,
            		           "assetFreq" : "4"
            		         }
            		       ],
            		       "liabilities" : [
            		         {
            		           "liabilityType" : "L1",
            		           "liabilityDesc" : "Total Liabilities",
            		           "liabilityAmt" : liabilities,
            		           "liabilityFreq" : "4"
            		         }
            		       ],
            		       "consents" : [
            		         {
            		           "zzConsentCode" : "0003",
            		           "zzConsentResp" : "N"
            		         },
            		         {
            		           "zzConsentCode" : "0001",
            		           "zzConsentResp" : "N"
            		         },
            		         {
            		           "zzConsentCode" : "0002",
            		           "zzConsentResp" : "N"
            		         },
            		         {
            		           "zzConsentCode" : "08",
            		           "zzConsentResp" : "Y"
            		         },
            		         {
            		           "zzConsentCode" : "07",
            		           "zzConsentResp" : "Y"
            		         }
            		       ],
            		       "pip" : {
            		         "publicOfficial" : "N",
            		         "publicOfficialRelated" : "N",
            		         "relationshipNature" : "",
            		         "publicOfficialFirstName" : "",
            		         "publicOfficialLastName" : ""
            		       }
            		     }
            		   ],
            		   "entityInfo" : {
            		     "turnover" : [
            		       {
            		         "incomeType" : "I1",
            		         "incomeDesc" : "Total Income",
            		         "incomeAmt" : turnover,
            		         "incomeFreq" : "7",
            		         "incomeFreqText" : "ANNUALLY"
            		       }
            		     ],
            		     "assets" : [
            		       {
            		         "assetType" : "A1",
            		         "assetDesc" : "Total Assets",
            		         "assetAmt" : EntityAssets,
            		         "assetFreq" : "7"
            		       }
            		     ],
            		     "expenses" : [
            		       {
            		         "expenseType" : "E1",
            		         "expenseDesc" : "Total Expenses",
            		         "expenseAmt" : EntityExp,
            		         "expenseFreq" : "7",
            		         "expenseFreqText" : "ANNUALLY"
            		       }
            		     ],
            		     "liabilities" : [
            		       {
            		         "liabilityType" : "L1",
            		         "liabilityDesc" : "Total Liabilities",
            		         "liabilityAmt" : EntityLiabilities,
            		         "liabilityFreq" : "7"
            		       }
            		     ],
            		     "consents" : [
            		       {
            		         "zzConsentCode" : "0003",
            		         "zzConsentResp" : "N"
            		       },
            		       {
            		         "zzConsentCode" : "0001",
            		         "zzConsentResp" : "N"
            		       },
            		       {
            		         "zzConsentCode" : "0002",
            		         "zzConsentResp" : "N"
            		       },
            		       {
            		         "zzConsentCode" : "08",
            		         "zzConsentResp" : "Y"
            		       },
            		       {
            		         "zzConsentCode" : "07",
            		         "zzConsentResp" : "Y"
            		       },
            		       {
            		         "zzConsentCode" : "11",
            		         "zzConsentResp" : "Y"
            		       },
            		       {
            		         "zzConsentCode" : "12",
            		         "zzConsentResp" : "Y"
            		       }
            		     ]
            		   },
            		   "legalDelMeth" : deliveryMethod
            		 }
               this.callCreateQuoteAPI(oData);              
           },
             
           callCreateQuoteAPI: function(oData){
        	    var oBusyDialog_Global = new sap.m.BusyDialog();
				oBusyDialog_Global.open();
				var sUrl = "http://s1c7na2z.standardbank.co.za:8002/sbsa/ao/700/quotes";
        	    //var sUrl = "http://d1sapa1z.standardbank.co.za:8015/sbsa/ao/715/quotes";
		        var aData = $.ajax({
		            type : "POST",
		            contentType : "application/json",
		            url : sUrl,
		            dataType : "json",
		            data: JSON.stringify(oData),
		            accepts: {
		                text: "application/json"
		            },
		            async: false,
		            success: function(odata, textStatus, XMLHttpRequest) {
		            	//alert("Success Put");
		            	oBusyDialog_Global.close();
	            	},
	            	error: function() {
	            		oBusyDialog_Global.close();
	            		sap.m.MessageToast.show("Error trying to Create Quote");
	            	} });
		        this.onPressGetQuotes();
		        this.oDialogQuote.close();
           },
           
           onProductChange: function(oEvent){
        	   var productID = sap.ui.core.Fragment.byId("idQuoteFragment", "productSelect").getSelectedKey();
        	   
        	   if(productID == "ZAOD") {
        		   sap.ui.core.Fragment.byId("idQuoteFragment", "idCreditTerm").setText("12");
        		   sap.ui.core.Fragment.byId("idQuoteFragment", "accountSelect").setEnabled(true);
        	   } else if(productID == "BRCP") {
        		   sap.ui.core.Fragment.byId("idQuoteFragment", "idCreditTerm").setText("60");
        		   sap.ui.core.Fragment.byId("idQuoteFragment", "accountSelect").setEnabled(false);
        	   };
          },
           
          onOfferProductChange: function(oEvent){
       	   var productID = sap.ui.core.Fragment.byId("idOfferFragment", "productSelect").getSelectedKey();
       	   
       	   if(productID == "ZAOD") {
       		   sap.ui.core.Fragment.byId("idOfferFragment", "idCreditTerm").setText("12");
       		   sap.ui.core.Fragment.byId("idOfferFragment", "accountSelect").setEnabled(true);
       	   } else if(productID == "BRCP") {
       		   sap.ui.core.Fragment.byId("idOfferFragment", "idCreditTerm").setText("60");
       		   sap.ui.core.Fragment.byId("idOfferFragment", "accountSelect").setEnabled(false);
       	   };
         },
         
          onPressCreateOffer: function(oEvent) {
        	   
			   if (!this.oDialogOffer) {
			   	  this.oDialogOffer = sap.ui.xmlfragment("idOfferFragment","zbp_utility.offer", this);
			   }
				   
			   //Loop through Accounts in ProductPortfolio and populate Accounts Select DropDownBox
			   var oModel = this.getView().getModel();
			   var accounts = oModel.getProperty("/output/bpAccounts");
			   var selectListAccounts = [];
			   var offerModel = new sap.ui.model.json.JSONModel();
				
			   if(accounts) {
			     for (var i = 0; i < accounts.length; i++){
				     var systemId  = accounts[i].systemId;
   			     var accountId = accounts[i].accountId;
				     var productId = accounts[i].accountProductId;
				     var status    = accounts[i].accountStatus;
				     var productId = accounts[i].accountProductId;
				     if( (productId == "0161") || (productId == "4477") || (productId == "4478") || (productId == "4648") &&
					     (status == "E0004") ) {
					     var itemRow = {systemId: systemId, 
						                accountId: accountId,
							   		    productId: productId};
				         selectListAccounts.push(itemRow);
				     } 
			     }
			   }  
			     
			   //Get Opportunities
			   var oModelOpps = this.getView().byId("idQuoteItemsTable").getModel();
			   var opportunities = oModelOpps.getProperty("/opportunities");
			   var selectListOpportunities = [];
				
			   if(opportunities) {
			     for (var i = 0; i < opportunities.length; i++){
				     var oppId  = opportunities[i].opportId;
  				     var itemRow = {oppId: oppId};
				         selectListOpportunities.push(itemRow);
				 }
			   }  
			   
			   var aChangeInfo = {
					   				Accounts : [
					   				{}
					   				],
					   				Opportunities : [
					   				{}	
					   				],
	        			       		RelatedParties : [
	        			       		{}
	        			       		],
	        			       		DeliveryMethods : [
		        			       	{}
		        			       	]
			   };
			   if(selectListAccounts) {
			     aChangeInfo["Accounts"] = selectListAccounts;
			   }
			   if(selectListOpportunities) {
				     aChangeInfo["Opportunities"] = selectListOpportunities;
			   }
			   
			   //Loop through Related Parties and populate Related Parties Select DropDownBox
			   var relatedParties = oModel.getProperty("/output/bpRelations");
			   var selectListRelatedParties = [];
			   var entityType = oModel.getProperty("/output/mainInfo/legalEnty");

			   if(relatedParties) {
			     for (var i = 0; i < relatedParties.length; i++){
				     var relType   = relatedParties[i].relType;
				     var partner   = relatedParties[i].partner;
				     var name      = relatedParties[i].partnerName;
				     var dateTo    = relatedParties[i].dateTo;
				   
				     // Sole Proprietor
				     if( (entityType=="ZL") && (relType == "ZSOLEP") && (dateTo == "9999-12-31") ) {
					     var itemRow = {bpId: partner, 
						  	   		    name: name};
				         selectListRelatedParties.push(itemRow);
				     }
				   
				     // Close Corporation
				     if( (entityType=="01") && (relType == "ZMEMBE") && (dateTo == "9999-12-31") ) {
					     var itemRow = {bpId: partner, 
							   		    name: name};
				         selectListRelatedParties.push(itemRow);
				     }
				   
				     // Private Company
				     if( (entityType=="07") && (relType == "ZDIREC") && (dateTo == "9999-12-31") ) {
					     var itemRow = {bpId: partner, 
						  	   		    name: name};
				         selectListRelatedParties.push(itemRow);
				     }
			     }
			   }  
			   if(selectListRelatedParties) {
			     aChangeInfo["RelatedParties"] = selectListRelatedParties;
			   }
			     
			   // Delivery Methods
			   var selectListDeliveryMethods = [];
			   var itemRow = {code: "ZHND", 
				   		      desc: "Hand Delivery"};
			   selectListDeliveryMethods.push(itemRow);
			   itemRow = {code: "ZRGM", 
			   		      desc: "Registered Mail"};
		       selectListDeliveryMethods.push(itemRow);
		       itemRow = {code: "ZNKN", 
			   		      desc: "Not Known"};
		       selectListDeliveryMethods.push(itemRow);
		       aChangeInfo["DeliveryMethods"] = selectListDeliveryMethods;       
			   
			   
			   // Add data to Model and bind Model to oDialog Object
			   offerModel.setData(aChangeInfo);
			   this.oDialogOffer.setModel(offerModel);
			   this.oDialogOffer.open();
          },
          
          onPressOfferCancel: function(oEvent){
              //var oDialogQuote = oEvent.getSource().getParent();
              this.oDialogOffer.close();
          },
                      
           handleSearch: function (oEvent) {
     			var sValue = oEvent.getParameter("value");
     			var oFilter = new Filter("/relatedParties", FilterOperator.Contains, sValue);
     			var oBinding = oEvent.getSource().getBinding("items");
     			oBinding.filter([oFilter]);
     		}

		});
});