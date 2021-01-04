// Calling model json file for data reference
var sample = $.sap.getModulePath("ZBP_UTILITY","/model/sampleData4.json");
var oModel = new sap.ui.model.json.JSONModel(sample);
var oModelOld = new sap.ui.model.json.JSONModel(sample);
var aChangeInfo = [];


sap.ui.controller("zbp_utility.main",
		{

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
				
				var riskScore = oModelOld.getProperty("/output/mainInfo/riskRating/riskScore");
				var riskLevel = oModelOld.getProperty("/output/mainInfo/riskRating/riskLevel");
				this.getView().byId("riskScore").setValue(riskScore);
				this.getView().byId("riskLevel").setText(riskLevel);
				//"{/output/mainInfo/riskRating/riskScore}";
				
			},
			
			onPressSave : function(evt) {
				var newModel = new sap.ui.model.json.JSONModel();
				var aData = [];
				//var aData2 = oModel.getProperty("/output/bpRiskInd");
				var oTable = this.getView().byId('idRiskTable');
				for (var i = 0; i < oTable.getItems().length; i++){
				    var oProperty = this.getView().getModel().getProperty(oTable.getItems()[i].getBindingContext().getPath());
				    var itemRow = {riskInd: oProperty.riskInd, status: oProperty.status};
				    aData.push(itemRow);
				    //oModel.push(itemRow);
				    //newModel.setProperty("/riskInd", itemRow);
				}
				aChangeInfo["bpRiskInd"] = aData;
				newModel.setData(aChangeInfo);
				
				
			    //var aItems = table.getRows(); //this doesn't work
			    //var cols = table.getColumns(); //this works
				
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
				this.getView().setModel(oModel);
				sap.ui.getCore().setModel(oModel);
				oModelOld.loadData();
				var bpID = this.getView().byId("bpInput").getValue();
				var sUrl = "http://d1sapa1z.standardbank.co.za:8015/sbsa/ao/715/utilities/" + bpID;
				
			/*	var oModel = new sap.ui.model.json.JSONModel();
		        var aData = jQuery.ajax({
		            type : "GET",
		            contentType : "application/json",
		            url : sUrl,
		            dataType : "json",
		            accepts: {
		                text: "application/json"
		            },
		            async: false,
		            success : function(data,textStatus, jqXHR) {
		                oModel.setData(data); 
		                alert("success to post");
		            }

		        });*/
				
/*		        this.getView().setModel(oModelServer);
		        sap.ui.getCore().setModel(oModel);
		        oModelOld.loadData();*/
		        
				//var list = this.getView().byId("idList1");
				//list.setModel(oModel);
				//var table = this.getView().byId("idAccountsTable");
				//table.setModel(oModel);
			},
			
			pressGetQuotes : function(evt) {
				var sample = $.sap.getModulePath("ZBP_UTILITY","/model/sampleQuotes.json");
				var oModel = new sap.ui.model.json.JSONModel(sample);
				
				this.getView().byId("idQuotes").setModel(oModel);
				//this.getView().setModel(oModel);
				
				
			},
			
			onPressOpportID : function (oEvent) {
				var oSelectedItem = oEvent.getSource().getParent();
				var oBindingContext = oSelectedItem.getBindingContext();
				this.getView().byId("idQuoteItemsTable").setBindingContext(oBindingContext);
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
           
           onButtonPress: function(oEvent){
               var oDialog = oEvent.getSource().getParent();
               oDialog.close();
             },
             
           handleSearch: function (oEvent) {
     			var sValue = oEvent.getParameter("value");
     			var oFilter = new Filter("/relatedParties", FilterOperator.Contains, sValue);
     			var oBinding = oEvent.getSource().getBinding("items");
     			oBinding.filter([oFilter]);
     		}

		});