/*
jQuery.sheet() The Web Based Spreadsheet
$Id: jquery.sheet.js 301 2010-11-09 12:59:13Z RobertLeePlummerJr $
http://code.google.com/p/jquerysheet/
		
Copyright (C) 2010 Robert Plummer
Dual licensed under the LGPL v2 and GPL v2 licenses.
http://www.gnu.org/licenses/
*/

/*
	Dimensions Info:
		When dealing with size, it seems that outerHeight is generally the most stable cross browser
		attribute to use for bar sizing.  We try to use this as much as possible.  But because col's
		don't have boarders, we subtract or add jS.s.boxModelCorrection for those browsers.
	tr/td column and row Index VS cell/column/row index
		DOM elements are all 0 based (tr/td/table)
		Spreadsheet elements are all 1 based (A1, A1:B4, TABLE2:A1, TABLE2:A1:B4)
		Column/Row/Cell
	DOCTYPE:
		It is recommended to use STRICT doc types on the viewing page when using sheet to ensure that the heights/widths of bars and sheet rows show up correctly
		Example of recommended doc type: <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
*/
jQuery.fn.extend({
	sheet: function(settings) {
		var o;
		settings = jQuery.extend({
			editable: 			true, 							//bool, Makes the jSheetControls_formula & jSheetControls_fx appear
			allowToggleState: 	true,							//allows the function that changes the spreadsheet's state from static to editable and back
			newColumnWidth: 	40, 							//int, the width of new columns or columns that have no width assigned
			inlineMenu:			null, 							//html, menu for editing sheet
			buildSheet: 		false,							//bool, string, or object
																	//bool true - build sheet inside of parent
																	//bool false - use urlGet from local url
																	//string  - '{number_of_cols}x{number_of_rows} (5x100)
																	//object - table
			log: 				false, 							//bool, turns some debugging logs on (jS.log('msg'))
			lockFormulas: 		false, 							//bool, turns the ability to edit any formula off
			parent: 			jQuery(this), 					//object, sheet's parent, DON'T CHANGE
			colMargin: 			18, 							//int, the height and the width of all bar items, and new rows
			fnBefore: 			function() {}, 					//fn, called just before jQuery.sheet loads
			fnAfter: 			function() {},	 				//fn, called just after all sheets load
			fnClose: 			function() {}, 					//fn, default clase function, more of a proof of concept
			fnAfterTabChanged:		function() {},					//fn, called just after someone edits a cell
			fnAfterCellEdit:	function() {},					//fn, called just after someone edits a cell
			fnSwitchSheet:		function() {},					//fn, called when a spreadsheet is switched inside of an instance of sheet
			fnPaneScroll:		function() {},					//fn, called when a spreadsheet is scrolled
			joinedResizing: 	false, 							//bool, this joins the column/row with the resize bar
			boxModelCorrection: 2, 								//int, attempts to correct the differences found in heights and widths of different browsers, if you mess with this, get ready for the must upsetting and delacate js ever
			showErrors:			true,							//bool, will make cells value an error if spreadsheet function isn't working correctly or is broken
			cellSelectModel: 	'excel',						//string, 'excel' || 'oo' || 'gdocs' Excel sets the first cell onmousedown active, openoffice sets the last, now you can choose how you want it to be ;)
			autoAddCells:		true,							//bool, when user presses enter on the last row, this will allow them to add another cell, thus improving performance and optimizing modification speed
			minSize: 			{rows: 2, cols: 2},			//object - {rows: int, cols: int}, Makes the sheet stay at a certain size when loaded in edit mode, to make modification more productive
			forceColWidthsOnStartup:true						//bool, makes cell widths load from pre-made colgroup/col objects, use this if you plan on making the col items, makes widths more stable on startup
		}, settings);
		
		o = settings.parent;
		if (jQuery.sheet.instance) {
			o.sheetInstance = jQuery.sheet.createInstance(settings, jQuery.sheet.instance.length, o);
			jQuery.sheet.instance.push(o.sheetInstance);
		} else {
			o.sheetInstance = jQuery.sheet.createInstance(settings, 0, o);
			jQuery.sheet.instance = [o.sheetInstance];
		}
		return o;
	}
});

jQuery.sheet = {
	createInstance: function(s, I, origParent) { //s = jQuery.sheet settings, I = jQuery.sheet Instance Integer
		var jS = {
			i: 0,
			I: I,
			sheetCount: 0,
			s: {},//s = settings object, used for shorthand, populated from jQuery.sheet
			obj: {//obj = object references
				//Please note, class references use the tag name because it's about 4 times faster
				barCorner:			function() { return jQuery('#' + jS.id.barCorner + jS.i); },
				barCornerAll:		function() { return s.parent.find('div.' + jS.cl.barCorner); },
				barCornerParent:	function() { return jQuery('#' + jS.id.barCornerParent + jS.i); },
				barCornerParentAll: function() { return s.parent.find('td.' + jS.cl.barCornerParent); },
				barTop: 			function() { return jQuery('#' + jS.id.barTop + jS.i); },
				barTopAll:			function() { return s.parent.find('div.' + jS.cl.barTop); },
				barTopParent: 		function() { return jQuery('#' + jS.id.barTopParent + jS.i); },
				barTopParentAll:	function() { return s.parent.find('div.' + jS.cl.barTopParent); },
				barLeft: 			function() { return jQuery('#' + jS.id.barLeft + jS.i); },
				barLeftAll:			function() { return s.parent.find('div.' + jS.cl.barLeft); },
				barLeftParent: 		function() { return jQuery('#' + jS.id.barLeftParent + jS.i); },
				barLeftParentAll:	function() { return s.parent.find('div.' + jS.cl.barLeftParent); },
				cellActive:			function() { return jQuery(jS.cellLast.td); },
				cellHighlighted:	function() { return jQuery(jS.highlightedLast.td); },
				controls:			function() { return jQuery('#' + jS.id.controls); },
				formula: 			function() { return jQuery('#' + jS.id.formula); },
				fullScreen:			function() { return jQuery('div.' + jS.cl.fullScreen); },
				inlineMenu:			function() { return jQuery('#' + jS.id.inlineMenu); },
				inPlaceEdit:		function() { return jQuery('#' + jS.id.inPlaceEdit); },
				label: 				function() { return jQuery('#' + jS.id.label); },
				log: 				function() { return jQuery('#' + jS.id.log); },
				menu:				function() { return jQuery('#' + jS.id.menu); },
				pane: 				function() { return jQuery('#' + jS.id.pane + jS.i); },
				paneAll:			function() { return s.parent.find('div.' + jS.cl.pane); },
				parent: 			function() { return s.parent; },
				sheet: 				function() { return jQuery('#' + jS.id.sheet + jS.i); },
				sheetAll: 			function() { return s.parent.find('table.' + jS.cl.sheet); },
				tab:				function() { return jQuery('#' + jS.id.tab + jS.i); },
				tabAll:				function() { return this.tabContainer().find('a.' + jS.cl.tab); },
				tabContainer:		function() { return jQuery('#' + jS.id.tabContainer); },
				tableBody: 			function() { return document.getElementById(jS.id.sheet + jS.i); },
				tableControl:		function() { return jQuery('#' + jS.id.tableControl + jS.i); },
				tableControlAll:	function() { return s.parent.find('table.' + jS.cl.tableControl); },
				title:				function() { return jQuery('#' + jS.id.title); },
				ui:					function() { return jQuery('#' + jS.id.ui); },
				uiActive:			function() { return s.parent.find('div.' + jS.cl.uiActive); }
			},
			id: {
				/*
					id = id's references
					Note that these are all dynamically set
				*/
				barCorner:			'jSheetBarCorner_' + I + '_',
				barCornerParent:	'jSheetBarCornerParent_' + I + '_',
				barTop: 			'jSheetBarTop_' + I + '_',
				barTopParent: 		'jSheetBarTopParent_' + I + '_',
				barLeft: 			'jSheetBarLeft_' + I + '_',
				barLeftParent: 		'jSheetBarLeftParent_' + I + '_',
				controls:			'jSheetControls_' + I,
				formula: 			'jSheetControls_formula_' + I,
				inlineMenu:			'jSheetInlineMenu_' + I,
				inPlaceEdit:		'jSheetInPlaceEdit_' + I,
				label: 				'jSheetControls_loc_' + I,
				log: 				'jSheetLog_' + I,
				menu:				'jSheetMenu_' + I,
				pane: 				'jSheetEditPane_' + I + '_',
				sheet: 				'jSheet_' + I + '_',
				tableControl:		'tableControl_' + I + '_',
				tab:				'jSheetTab_' + I + '_',
				tabContainer:		'jSheetTabContainer_' + I,
				title:				'jSheetTitle_' + I,
				ui:					'jSheetUI_' + I
			},
			cl: {
				/*
					cl = class references
				*/
				barCorner:				'jSheetBarCorner',
				barCornerParent:		'jSheetBarCornerParent',
				barLeftTd:				'barLeft',
				barLeft: 				'jSheetBarLeft',
				barLeftParent: 			'jSheetBarLeftParent',
				barTop: 				'jSheetBarTop',
				barTopParent: 			'jSheetBarTopParent',
				barTopTd:				'barTop',
				cellActive:				'jSheetCellActive',
				cellHighlighted: 		'jSheetCellHighighted',
				controls:				'jSheetControls',
				formula: 				'jSheetControls_formula',
				inlineMenu:				'jSheetInlineMenu',
				fullScreen:				'jSheetFullScreen',
				inPlaceEdit:			'jSheetInPlaceEdit',
				menu:					'jSheetMenu',
				parent:					'jSheetParent',
				sheet: 					'jSheet',
				sheetPaneTd:			'sheetPane',
				label: 					'jSheetControls_loc',
				log: 					'jSheetLog',
				pane: 					'jSheetEditPane',
				tab:					'jSheetTab',
				tabContainer:			'jSheetTabContainer',
				tabContainerFullScreen: 'jSheetFullScreenTabContainer',
				tableControl:			'tableControl',
				title:					'jSheetTitle',
				ui:						'jSheetUI',
				uiActive:				'ui-state-active',
				uiBar: 					'ui-widget-header',
				uiCellActive:			'ui-state-active',
				uiCellHighlighted: 		'ui-state-highlight',
				uiControl: 				'ui-widget-header ui-corner-top',
				uiControlTextBox:		'ui-widget-content',
				uiFullScreen:			'ui-widget-content ui-corner-all',
				uiInPlaceEdit:			'ui-state-active',
				uiMenu:					'ui-state-highlight',
				uiMenuUl: 				'ui-widget-header',
				uiMenuLi: 				'ui-widget-header',
				uiMenuHighlighted: 		'ui-state-highlight',
				uiPane: 				'ui-widget-content',
				uiParent: 				'ui-widget-content ui-corner-all',
				uiSheet:				'ui-widget-content',
				uiTab:					'ui-widget-header',
				uiTabActive:			'ui-state-highlight'
			},
			msg: { /*msg = messages used throught sheet, for easy access to change them for other languages*/
				addRowMulti: 		"Kaç satır eklemek istiyorsunuz?",
				addColumnMulti: 	"Kaç sütun eklemek istiyorsunuz?",
				newSheet: 			"Yeni matrisin boyutu ne olacak?\nÖrnek: 5 sütun ve 10 satır için '5x10' girin.",
				deleteRow: 			"Bu satırı silmek istediğinize emin misiniz?",
				deleteColumn: 		"Bu sütunu silmek istediğinize emin misiniz?",
				openSheet: 			"Açmak istediğinize emin misiniz? Tüm kaydedilmemiş çalışmalar kaybolacak.",
				cellFind: 			"Birşey bulunamadı.",
				toggleHideRow:		"Satır seçili değil.",
				toggleHideColumn: 	"Sütun seçili değil."
			},
			kill: function() { /* For ajax manipulation, kills this instance of sheet entirley */
				jS.obj.tabContainer().remove();
				jS.obj.fullScreen().remove();
				jS.obj.inPlaceEdit().remove();
				origParent.removeClass(jS.cl.uiParent).html('');
				delete s;
				delete jQuery.sheet.instance[I];
				delete jS;
				delete origParent.sheetInstance;
			},
			controlFactory: { /* controlFactory creates the different objects requied by sheet */
				addRowMulti: function(qty, isBefore, skipFormulaReparse) { /* creates multi rows
															qty: int, the number of cells you'd like to add, if not specified, a dialog will ask; 
															isBefore: bool, places cells before the selected cell if set to true, otherwise they will go after, or at end
															skipFormulaReparse: bool, re-parses formulas if needed
														*/
					if (!qty) {
						qty = prompt(jS.msg.addRowMulti);
					}
					if (qty) {
						jS.controlFactory.addCells(null, isBefore, null, qty, 'row', skipFormulaReparse);
					}
				},
				addColumnMulti: function(qty, isBefore, skipFormulaReparse) { /* creates multi columns
															qty: int, the number of cells you'd like to add, if not specified, a dialog will ask; 
															isBefore: bool, places cells before the selected cell if set to true, otherwise they will go after, or at end
															skipFormulaReparse: bool, re-parses formulas if needed
														*/
					if (!qty) {
						qty = prompt(jS.msg.addColumnMulti);
					}
					if (qty) {
						jS.controlFactory.addCells(null, isBefore, null, qty, 'col', skipFormulaReparse);
					}
				},
				addCells: function(eq, isBefore, eqO, qty, type, skipFormulaReparse) { /*creates cells for sheet and the bars that go along with them
																		eq: int, position where cells should be added;
																		isBefore: bool, places cells before the selected cell if set to true, otherwise they will go after, or at end;
																		eq0: no longer used, kept for legacy;
																		qty: int, how many rows/columsn to add;
																		type: string - "col" || "row", determans the type of cells to add;
																		skipFormulaReparse: bool, re-parses formulas if needed
																*/			
					jS.setDirty(true);
					
					var sheet = jS.obj.sheet();
					var sheetWidth = sheet.width();
					
					//jS.evt.cellEditAbandon();
					
					qty = (qty ? qty : 1);
					type = (type ? type : 'col');
					
					//var barLast = (type == 'row' ? jS.rowLast : jS.colLast);
					var cellLastBar = (type == 'row' ? jS.cellLast.row : jS.cellLast.col);
					
					if (!eq) {
						if (cellLastBar == -1) {
							eq = ':last';
						} else {
							eq = ':eq(' + cellLastBar + ')';
						}
					} else if (!isNaN(eq)){
						eq = ':eq(' + (eq - 1) + ')';
					}
					
					var o;
					switch (type) {
						case "row":
							o = {
								bar: jS.obj.barLeft().find('div' + eq),
								barParent: jS.obj.barLeft(),
								cells: function() {
									return sheet.find('tr' + eq);
								},
								col: function() { return ''; },
								newBar: '<div class="' + jS.cl.uiBar + '" style="height: ' + (s.colMargin - s.boxModelCorrection) + 'px;" />',
								loc: function() {
									return jS.getTdLocation(o.cells().find('td:last'));
								},
								newCells: function() {
									var j = o.loc()[1];
									var newCells = '';
									
									for (var i = 0; i <= j; i++) {
										newCells += '<td />';
									}
									
									return '<tr style="height: ' + s.colMargin + 'px;">' + newCells + '</tr>';
								},
								newCol: '',
								reLabel: function() {								
									o.barParent.children().each(function(i) {
										jQuery(this).text(i + 1);
									});
								},
								dimensions: function(loc, bar, cell, col) {
									bar.height(cell.height(s.colMargin).outerHeight() - s.boxModelCorrection);
								},
								offset: [qty, 0]
							};
							break;
						case "col":
							o = {
								bar: jS.obj.barTop().find('div' + eq),
								barParent: jS.obj.barTop(),
								cells: function() {
									var cellStart = sheet.find('tr:first td' + eq);
									if (!cellStart[0]) {
										cellStart = sheet.find('tr:first th' + eq);
									}
									var cellEnd = sheet.find('td:last');
									var loc1 = jS.getTdLocation(cellStart);
									var loc2 = jS.getTdLocation(cellEnd);
									
									//we get the first cell then get all the other cells directly... faster ;)
									var cells = jQuery(jS.getTd(jS.i, loc1[0], loc1[1]));
									var cell;
									for (var i = 1; i <= loc2[0]; i++) {
										cells.push(jS.getTd(jS.i, i, loc1[1]));
									}
									
									return cells;
								},
								col: function() {
									return sheet.find('col' + eq);
								},
								newBar: '<div class="' + jS.cl.uiBar + '"/>',
								newCol: '<col />',
								loc: function(cells) {
									cells = (cells ? cells : o.cells());
									return jS.getTdLocation(cells.first());
								},
								newCells: function() {
									return '<td />';
								},
								reLabel: function() {
									o.barParent.children().each(function(i) {
										jQuery(this).text(i + 1);
									});
								},
								dimensions: function(loc, bar, cell, col) {								
									var w = s.newColumnWidth;
									col
										.width(w)
										.css('width', w + 'px')
										.attr('width', w + 'px');
									
									bar
										.width(w - s.boxModelCorrection);
									
									sheet.width(sheetWidth + (w * qty));
								},
								offset: [0, qty]
							};
							break;
					}
					
					//make undoable
					jS.cellUndoable.add(jQuery(sheet).add(o.barParent));
					
					var cells = o.cells();
					var loc = o.loc(cells);	
					var col = o.col();
					
					var newBar = o.newBar;
					var newCell = o.newCells();
					var newCol = o.newCol;
					
					var newCols = '';
					var newBars = '';
					var newCells = '';
					
					for (var i = 0; i < qty; i++) { //by keeping these variables strings temporarily, we cut down on using system resources
						newCols += newCol;
						newBars += newBar;
						newCells += newCell;
					}
					
					newCols = jQuery(newCols);
					newBars = jQuery(newBars);
					newCells = jQuery(newCells);
					
					if (isBefore) {
						cells.before(newCells);
						o.bar.before(newBars);
						jQuery(col).before(newCols);
					} else {
						cells.after(newCells);
						o.bar.after(newBars);
						jQuery(col).after(newCols);
					}
					
					jS.setTdIds(sheet);
					
					o.dimensions(loc, newBars, newCells, newCols);
					o.reLabel();

					jS.obj.pane().scroll();
					
					if (!skipFormulaReparse && eq != ':last' && !isBefore) {
						//offset formulas
						jS.offsetFormulaRange((isBefore ? loc[0] - qty : loc[0]) , (isBefore ? loc[1] - qty : loc[0]), o.offset[0], o.offset[1], isBefore);
					}
					
					//Because the line numbers get bigger, it is possible that the bars have changed in size, lets sync them
					jS.sheetSyncSize();
					
					//Let's make it redoable
					jS.cellUndoable.add(jQuery(sheet).add(o.barParent));
				},
				addRow: function(atRow, isBefore, atRowQ) {/* creates single row
															qty: int, the number of cells you'd like to add, if not specified, a dialog will ask; 
															isBefore: bool, places cells before the selected cell if set to true, otherwise they will go after, or at end
														*/
					jS.controlFactory.addCells(atRow, isBefore, atRowQ, 1, 'row');
				},
				addColumn: function(atColumn, isBefore, atColumnQ) {/* creates single column
															qty: int, the number of cells you'd like to add, if not specified, a dialog will ask; 
															isBefore: bool, places cells before the selected cell if set to true, otherwise they will go after, or at end
														*/
					jS.controlFactory.addCells(atColumn, isBefore, atColumnQ, 1, 'col');
				},
				barLeft: function(reloadHeights, o) { /* creates all the bars to the left of the spreadsheet
															reloadHeights: bool, reloads all the heights of each bar from the cells of the sheet;
															o: object, the table/spreadsheeet object
													*/
					jS.obj.barLeft().remove();
					var barLeft = jQuery('<div border="1px" id="' + jS.id.barLeft + jS.i + '" class="' + jS.cl.barLeft + '" />');
					var heightFn;
					if (reloadHeights) { //This is our standard way of detecting height when a sheet loads from a url
						heightFn = function(i, objSource, objBar) {
							objBar.height(parseInt(objSource.outerHeight()) - s.boxModelCorrection);
						};
					} else { //This way of detecting height is used becuase the object has some problems getting
							//height because both tr and td have height set
							//This corrects the problem
							//This is only used when a sheet is already loaded in the pane
						heightFn = function(i, objSource, objBar) {
							objBar.height(parseInt(objSource.css('height').replace('px','')) - s.boxModelCorrection);
						};
					}
					
					o.find('tr').each(function(i) {
						var child = jQuery('<div>' + (i + 1) + '</div>');
						jQuery(barLeft).append(child);
						heightFn(i, jQuery(this), child);
					});
					
					jS.evt.barMouseDown.height(
						jS.obj.barLeftParent().append(barLeft)
					);
				},
				barTop: function(reloadWidths, o) { /* creates all the bars to the top of the spreadsheet
															reloadWidths: bool, reloads all the widths of each bar from the cells of the sheet;
															o: object, the table/spreadsheeet object
													*/
					jS.obj.barTop().remove();
					var barTop = jQuery('<div id="' + jS.id.barTop + jS.i + '" class="' + jS.cl.barTop + '" />');
					barTop.height(s.colMargin);
					
					var parents;
					var widthFn;
					
					if (reloadWidths) {
						parents = o.find('tr:first').find('td,th');
						widthFn = function(obj) {
							return jS.attrH.width(obj);
						};
					} else {
						parents = o.find('col');
						widthFn = function(obj) {
							return parseInt(jQuery(obj).css('width').replace('px','')) - s.boxModelCorrection;
						};
					}
					
					parents.each(function(i) {
						var v = i + 1;
						var w = widthFn(this);
						
						var child = jQuery("<div>" + v + "</div>")
							.width(w)
							.height(s.colMargin);
						barTop.append(child);
					});
					
					jS.evt.barMouseDown.width(
						jS.obj.barTopParent().append(barTop)
					);
				},
				header: function() { /* creates the control/container for everything above the spreadsheet */
					jS.obj.controls().remove();
					jS.obj.tabContainer().remove();
					
					var header = jQuery('<div id="' + jS.id.controls + '" class="' + jS.cl.controls + '"></div>');
					
					var firstRow = jQuery('<table cellpadding="0" cellspacing="0" border="0"><tr /></table>').prependTo(header);
					var firstRowTr = jQuery('<tr />');
					
					
					if (s.inlineMenu && s.editable) {
						var inlineMenu;
						if (jQuery.isFunction(s.inlineMenu)) {
							inlineMenu = s.inlineMenu(jS);
						} else {
							inlineMenu = s.inlineMenu;
						}
						firstRowTr.append(jQuery('<td id="' + jS.id.inlineMenu + '" class="' + jS.cl.inlineMenu + '" />').html(inlineMenu));
					}
					
					if (s.editable) {
						
						//Edit box menu
						var secondRow = jQuery('<table cellpadding="0" cellspacing="0" border="0">' +
								'<tr>' +
									'<td id="' + jS.id.label + '" class="' + jS.cl.label + '"></td>' +
									'<td>' +
										'<textarea id="' + jS.id.formula + '" class="' + jS.cl.formula + '"></textarea>' +
									'</td>' +
								'</tr>' +
							'</table>')
							.keydown(jS.evt.keyDownHandler.formulaOnKeyDown)
							.keyup(function() {
								jS.obj.inPlaceEdit().val(jS.obj.formula().val());
							})
							.change(function() {
								jS.obj.inPlaceEdit().val(jS.obj.formula().val());
							})
							.appendTo(header);
					}
					
					firstRowTr.appendTo(firstRow);
					
					var tabParent = jQuery('<div id="' + jS.id.tabContainer + '" class="' + jS.cl.tabContainer + '">' + 
									(s.editable ? '<span class="' + jS.cl.uiTab + ' ui-corner-bottom" title="Matris Ekle" i="-1">+</span>' : '<span />') + 
								'</div>')
							.mousedown(jS.evt.tabOnMouseDown);

					s.parent
						.html('')
						.append(header) //add controls header
						.append('<div id="' + jS.id.ui + '" class="' + jS.cl.ui + '">') //add spreadsheet control
						.after(tabParent);
				},
				sheetUI: function(o, i, fn, reloadBars) { /* creates the spreadsheet user interface
															o: object, table object to be used as a spreadsheet;
															i: int, the new count for spreadsheets in this instance;
															fn: function, called after the spreadsheet is created and tuned for use;
															reloadBars: bool, if set to true reloads id bars on top and left;
														*/
					if (!i) {
						jS.sheetCount = 0;
						jS.i = 0;
					} else {
						jS.sheetCount = parseInt(i);
						jS.i = jS.sheetCount;
						i = jS.i;
					}

					var objContainer = jS.controlFactory.table().appendTo(jS.obj.ui());
					var pane = jS.obj.pane().html(o);
					
				
					o = jS.tuneTableForSheetUse(o);
								
					jS.sheetDecorate(o);
					
					jS.controlFactory.barTop(reloadBars, o);
					jS.controlFactory.barLeft(reloadBars, o);
				
					jS.sheetTab(true);
					
					if (s.editable) {
						var formula = jS.obj.formula();
						pane
							.mousedown(function(e) {
								if (jS.isTd(e.target)) {
									jS.evt.cellOnMouseDown(e);
									return false;
								}
							})
							.disableSelection()
							.dblclick(jS.evt.cellOnDblClick);
					}
					
					jS.themeRoller.start(i);

					jS.setTdIds(o);
					
					jS.checkMinSize(o);
					
					jS.evt.scrollBars(pane);
					
					jS.addTab();
					
					if (fn) {
						fn(objContainer, pane);
					}
					
					jS.log('Sheet Initialized');
					
					
					s.fnAfterTabChanged(jS);
					
					return objContainer;
				},
				table: function() { /* creates the table control the will contain all the other controls for this instance */
					return jQuery('<table cellpadding="0" cellspacing="0" border="0" id="' + jS.id.tableControl + jS.i + '" class="' + jS.cl.tableControl + '">' +
						'<tbody>' +
							'<tr>' + 
								'<td id="' + jS.id.barCornerParent + jS.i + '" class="' + jS.cl.barCornerParent + '">' + //corner
									'<div style="height: ' + s.colMargin + '; width: ' + s.colMargin + ';" id="' + jS.id.barCorner + jS.i + '" class="' + jS.cl.barCorner +'"' + (s.editable ? ' onClick="jQuery.sheet.instance[' + I + '].cellSetActiveBar(\'all\');"' : '') + ' title="Tümünü Seç">&nbsp;</div>' +
								'</td>' + 
								'<td class="' + jS.cl.barTopTd + '">' + //barTop
									'<div id="' + jS.id.barTopParent + jS.i + '" class="' + jS.cl.barTopParent + '"></div>' +
								'</td>' +
							'</tr>' +
							'<tr>' +
								'<td class="' + jS.cl.barLeftTd + '">' + //barLeft
									'<div style="width: ' + s.colMargin + ';" id="' + jS.id.barLeftParent + jS.i + '" class="' + jS.cl.barLeftParent + '"></div>' +
								'</td>' +
								'<td class="' + jS.cl.sheetPaneTd + '">' + //pane
									'<div id="' + jS.id.pane + jS.i + '" class="' + jS.cl.pane + '"></div>' +
								'</td>' +
							'</tr>' +
						'</tbody>' +
					'</table>');
				},
				inPlaceEdit: function(td) { /* creates a teaxtarea for a user to put a value in that floats on top of the current selected cell
												td: object, the cell to be edited
											*/
					jS.obj.inPlaceEdit().remove();
					var formula = jS.obj.formula();					
					var offset = td.offset();
					var style = td.attr('style');
					var w = td.width();
					var h = td.height();
					var textarea = jQuery('<textarea id="' + jS.id.inPlaceEdit + '" class="' + jS.cl.inPlaceEdit + ' ' + jS.cl.uiInPlaceEdit + '" />')
						.css('left', offset.left)
						.css('top', offset.top)
						.width(w)
						.height(h)
						.keydown(jS.evt.inPlaceEditOnKeyDown)
						.keyup(function() {
							formula.val(textarea.val());
						})
						.change(function() {
							formula.val(textarea.val());
						})
						.appendTo('body')
						.val(formula.val())
						.focus()
						.select();
					
					//Make the textarrea resizable automatically
					if (jQuery.fn.elastic) {
						textarea.elastic();
					}
				}
			},
			sizeSync: { /* future location of all deminsion sync/mods */
			
			},
			evt: { /* event handlers for sheet; e = event */
				keyDownHandler: {
					enterOnInPlaceEdit: function(e) {
						if (!e.shiftKey) {
							return jS.evt.cellSetFocusFromKeyCode(e);
						} else {
							return true;
						}
					},
					enter: function(e) {
						if (!jS.cellLast.isEdit && !e.ctrlKey) {
							jS.cellLast.td.dblclick();
							return false;
						} else {
							return this.enterOnInPlaceEdit(e);
						}
					},
					tab: function(e) {
						return jS.evt.cellSetFocusFromKeyCode(e);
					},
					pasteOverCells: function(e) { //used for pasting from other spreadsheets
						if (e.ctrlKey) {
							var formula = jS.obj.formula(); //so we don't have to keep calling the function and wasting memory
							var oldVal = formula.val();
							formula.val('');  //we use formula to catch the pasted data
							var newValCount = 0;
							
							jQuery(document).one('keyup', function() {
								var loc = jS.getTdLocation(jS.cellLast.td); //save the currrent cell
								var val = formula.val(); //once ctrl+v is hit formula now has the data we need
								var firstValue = '';
								formula.val(''); 
								var tdsBefore = jQuery('<div />');
								var tdsAfter = jQuery('<div />');
								
								var row = val.split(/\n/g); //break at rows
								
								for (var i = 0; i < row.length; i++) {
									var col = row[i].split(/\t/g); //break at columns
									for (var j = 0; j < col.length; j++) {
										newValCount++;
										if (col[j]) {
											var td = jQuery(jS.getTd(jS.i, i + loc[0], j + loc[1]));
											
											tdsBefore.append(td.clone());
											
											
											if ((col[j] + '').charAt(0) == '=') { //we need to know if it's a formula here
												td.attr('formula', col[j]);
											} else {
												td
													.html(col[j])
													.removeAttr('formula'); //we get rid of formula because we don't know if it was a formula, to check may take too long
											}
											
											tdsAfter.append(td.clone());
											
											if (i == 0 && j == 0) { //we have to finish the current edit
												firstValue = col[j];
											}
										}
									}
								}
								
								jS.cellUndoable.add(tdsBefore.children());
								jS.cellUndoable.add(tdsAfter.children());
								
								formula.val(firstValue);								
								jS.setDirty(true);
								jS.evt.cellEditDone();
							});
						}
						return true;
					},
					findCell: function(e) {
						if (e.ctrlKey) { 
							jS.cellFind();
							return false;
						}
						return true;
					},
					redo: function(e) {
						if (e.ctrlKey && !jS.cellLast.isEdit) { 
							jS.cellUndoable.undoOrRedo();
							return false;
						}
						return true;
					},
					undo: function(e) {
						if (e.ctrlKey && !jS.cellLast.isEdit) {
							jS.cellUndoable.undoOrRedo(true);
							return false;
						}
						return true;
					},
					pageUpDown: function(reverse) {
						var pane = jS.obj.pane();
						var left = jS.cellLast.td.position().left;
						var top = 0;
						
						if (reverse) {
							top = 0;
							pane.scrollTop(pane.scrollTop() - pane.height());
							
						} else {
							top = pane.height() - (s.colMargin * 3);
							pane.scrollTop(pane.scrollTop() + top);
						}
						
						return jS.evt.cellSetFocusFromXY(left, top);
					},
					formulaOnKeyDown: function(e) {
						switch (e.keyCode) {
							case key.ESCAPE: 	jS.evt.cellEditAbandon();
								break;
							case key.TAB: 		return jS.evt.keyDownHandler.tab(e);
								break;
							case key.ENTER: 	return jS.evt.keyDownHandler.enter(e);
								break;
							case key.LEFT:
							case key.UP:
							case key.RIGHT:
							case key.DOWN:		return jS.evt.cellSetFocusFromKeyCode(e);
								break;
							case key.PAGE_UP:	return jS.evt.keyDownHandler.pageUpDown(true);
								break;
							case key.PAGE_DOWN:	return jS.evt.keyDownHandler.pageUpDown();
								break;
							case key.V:			return jS.evt.keyDownHandler.pasteOverCells(e);
								break;
							case key.Y:			return jS.evt.keyDownHandler.redo(e);
								break;
							case key.Z:			return jS.evt.keyDownHandler.undo(e);
								break;
							case key.F:			return jS.evt.keyDownHandler.findCell(e);
							case key.CONTROL: //we need to filter these to keep cell state
							case key.CAPS_LOCK:
							case key.SHIFT:
							case key.ALT:
							case key.UP:
							case key.DOWN:
							case key.LEFT:
							case key.RIGHT:
								break;
							case key.HOME:
							case key.END:		jS.evt.cellSetFocusFromKeyCode(e);
								break;
							default: 			jS.cellLast.isEdit = true;
						}
					}
				},
				inPlaceEditOnKeyDown: function(e) {
					switch (e.keyCode) {
						case key.ENTER: 	return jS.evt.keyDownHandler.enterOnInPlaceEdit(e);
							break;
						case key.TAB: 		return jS.evt.keyDownHandler.tab(e);
							break;
						case key.ESCAPE:	jS.evt.cellEditAbandon(); return false;
							break;
					}
				},
				inPlaceEditChange: function(e) {
					jS.obj.formula().val(jS.obj.inPlaceEdit().val());
				},
				cellEditDone: function() { /* called to edit a cells value from jS.obj.formula(), afterward setting "fnAfterCellEdit" is called w/ params (td, row, col, spreadsheetIndex, sheetIndex)
														forceCalc: bool, if set to true forces a calculation of the selected sheet
													*/
					switch (jS.cellLast.isEdit) {
						case true:
							jS.obj.inPlaceEdit().remove();
							var formula = jS.obj.formula();
							formula.unbind('keydown'); //remove any lingering events from inPlaceEdit
							var td = jS.cellLast.td;
							
							switch(jS.isFormulaEditable(td)) {
								case true:
									//Lets ensure that the cell being edited is actually active
									if (td) { 
										//first, let's make it undoable before we edit it
										jS.cellUndoable.add(td);
										
										//This should return either a val from textbox or formula, but if fails it tries once more from formula.
										var v = jS.manageTextToHtml(formula.val());
										var prevVal = td.html();
										td.html(v);										
									
										jS.attrH.setHeight(jS.cellLast.row, 'cell');
										
										//Save the newest version of that cell
										jS.cellUndoable.add(td);
										
										formula.focus().select();
										jS.cellLast.isEdit = false;
										
										jS.setDirty(true);
										
										//perform final function call
										s.fnAfterCellEdit({
											td: jS.cellLast.td,
											row: jS.cellLast.row,
											col: jS.cellLast.col,
											spreadsheetIndex: jS.i,
											sheetIndex: I
										});
									}
							}
							break;
						default:
							jS.attrH.setHeight(jS.cellLast.row, 'cell', false);
					}
				},
				cellEditAbandon: function() { /* removes focus of a selected cell and doesn't change it's value
														*/
					jS.obj.inPlaceEdit().remove();
					jS.themeRoller.cell.clearActive();
					jS.themeRoller.bar.clearActive();
					jS.themeRoller.cell.clearHighlighted();
					
					jS.cellLast.td = jQuery('<td />');
					jS.cellLast.row = jS.cellLast.col = -1;
					jS.rowLast = jS.colLast = -1;
					
					jS.labelUpdate('', true);
					jS.obj.formula()
						.val('');
					
					return false;
				},
				cellSetFocusFromXY: function(left, top, skipOffset) { /* a handy function the will set a cell active by it's location on the browser;
																		left: int, pixels left;
																		top: int, pixels top;
																		skipOffset: bool, skips offset;
																	*/
					var td = jS.getTdFromXY(left, top, skipOffset);
					
					if (jS.isTd(td)) {
						jS.themeRoller.cell.clearHighlighted();
						
						jS.cellEdit(td);
						return false;
					} else {
						return true;
					}
				},
				cellSetFocusFromKeyCode: function(e) { /* invoke a click on next/prev cell */
					var c = jS.cellLast.col; //we don't set the cellLast.col here so that we never go into indexes that don't exist
					var r = jS.cellLast.row;
					var overrideIsEdit = false;
					
					switch (e.keyCode) {
						case key.UP: 		r--; break;
						case key.DOWN: 		r++; break;
						case key.LEFT: 		c--; break;
						case key.RIGHT: 	c++; break;
						case key.ENTER:		r++;
							overrideIsEdit = true;
							if (s.autoAddCells) {
								if (jS.cellLast.row == jS.sheetSize()[0]) {
									jS.controlFactory.addRow(':last');
								}
							}
							break;
						case key.TAB:
							overrideIsEdit = true;
							if (e.shiftKey) {
								c--;
							} else {
								c++;
							}
							if (s.autoAddCells) {
								if (jS.cellLast.col == jS.sheetSize()[1]) {
									jS.controlFactory.addColumn(':last');
								}
							}
							break;
						case key.HOME:		c = 0; break;
						case key.END:		c = jS.cellLast.td.parent().find('td').length - 1; break;
					}
					
					//we check here and make sure all values are above -1, so that we get a selected cell
					c = (c < 0 ? 0 : c);
					r = (r < 0 ? 0 : r);
					
					//to get the td could possibly make keystrokes slow, we prevent it here so the user doesn't even know we are listening ;)
					if (!jS.cellLast.isEdit || overrideIsEdit) {
						//get the td that we want to go to
						var td = jS.getTd(jS.i, r, c);
					
						//if the td exists, lets go to it
						if (td) {
							jS.themeRoller.cell.clearHighlighted();
							jS.cellEdit(jQuery(td));
							return false;
						}
					}
					
					//default, can be overridden above
					return true;
				},
				cellOnMouseDown: function(e) {
					jS.cellEdit(jQuery(e.target), true);			
				},
				cellOnDblClick: function(e) {
					jS.cellLast.isEdit = jS.isSheetEdit = true;
					jS.controlFactory.inPlaceEdit(jS.cellLast.td);
					jS.log('click, in place edit activated');
				},
				tabOnMouseDown: function(e) {
					var i = jQuery(e.target).attr('i');
					
					if (i != '-1' && i != jS.i) {
						jS.setActiveSheet(i);
					} else if (i != '-1' && jS.i == i) {
						jS.sheetTab();
					} else {
						//jS.addSheet('5x10');
						jS.addSheet();
					}
					
					s.fnSwitchSheet(i);
					return false;
				},
				resizeBar: function(e, o) {
					//Resize Column & Row & Prototype functions are private under class jSheet		
					var target = jQuery(e.target);
					var resizeBar = {
						start: function(e) {
							
							jS.log('start resize');
							//I never had any problems with the numbers not being ints but I used the parse method
							//to ensuev non-breakage
							o.offset = target.offset();
							o.tdPageXY = [o.offset.left, o.offset.top][o.xyDimension];
							o.startXY = [e.pageX, e.pageY][o.xyDimension];
							o.i = o.getIndex(target);
							o.srcBarSize = o.getSize(target);
							o.edgeDelta = o.startXY - (o.tdPageXY + o.srcBarSize);
							o.min = 10;
							
							if (s.joinedResizing) {
								o.resizeFn = function(size) {
									o.setDesinationSize(size);
									o.setSize(target, size);
								};
							} else {
								o.resizeFn = function(size) {
									o.setSize(target, size);
								};
							}
							
							//We start the drag sequence
							if (Math.abs(o.edgeDelta) <= o.min) {
								//some ui enhancements, lets the user know he's resizing
								jQuery(e.target).parent().css('cursor', o.cursor);
								
								jQuery(document)
									.mousemove(resizeBar.drag)
									.mouseup(resizeBar.stop);
								
								return true; //is resizing
							} else {
								return false; //isn't resizing
							}
						},
						drag: function(e) {
							var newSize = o.min;

							var v = o.srcBarSize + ([e.pageX, e.pageY][o.xyDimension] - o.startXY);
							if (v > 0) {// A non-zero minimum size saves many headaches.
								newSize = Math.max(v, o.min);
							}

							o.resizeFn(newSize);
							return false;
						},
						stop: function(e) {
							o.setDesinationSize(o.getSize(target));
							
							jQuery(document)
								.unbind('mousemove')
								.unbind('mouseup');

							jS.obj.formula()
								.focus()
								.select();
							
							target.parent().css('cursor', 'pointer');
													
							jS.log('stop resizing');
						}
					};
					
					return resizeBar.start(e);
				},
				scrollBars: function(pane) { /* makes the bars scroll as the sheet is scrolled
												pane: object, the sheet's pane;
											*/
					var o = { //cut down on recursion, grab them once
						barLeft: jS.obj.barLeftParent(), 
						barTop: jS.obj.barTopParent()
					};
					
					pane.scroll(function() {
						o.barTop.scrollLeft(pane.scrollLeft());//2 lines of beautiful jQuery js
						o.barLeft.scrollTop(pane.scrollTop());
						
						s.fnPaneScroll(pane, jS.i);
					});
				},
				barMouseDown: { /* handles bar events, including resizing */
					select: function(o, e, selectFn, resizeFn) {
						var isResizing = jS.evt.resizeBar(e, resizeFn);
								
						if (!isResizing) {
							selectFn(e.target);
							o
								.unbind('mouseover')
								.mouseover(function(e) {
									selectFn(e.target);
								});
								
							jQuery(document)
								.one('mouseup', function() {
									o
										.unbind('mouseover')
										.unbind('mouseup');
								});
						}
						
						return false;
					},
					first: 0,
					last: 0,
					height: function(o) {			
						var selectRow = function () {};
						
						o //let any user resize
							.unbind('mousedown')
							.mousedown(function(e) {
								if (!jQuery(e.target).hasClass(jS.cl.barLeft)) {
									jS.evt.barMouseDown.first = jS.evt.barMouseDown.last = jS.rowLast = jS.getBarLeftIndex(e.target);
									jS.evt.barMouseDown.select(o, e, selectRow, jS.rowResizer);
								}
								return false;
							});
						if (s.editable) { //only let editable select
							selectRow = function(o) {
								if (!jQuery(o).attr('id')) {
									var i = jS.getBarLeftIndex(o);
									
									jS.rowLast = i; //keep track of last row for inserting new rows
									jS.evt.barMouseDown.last = i;
									
									jS.cellSetActiveBar('row', jS.evt.barMouseDown.first, jS.evt.barMouseDown.last);
								}
							};
						}
					},
					width: function(o) {
						var selectColumn = function() {};
						
						o //let any user resize
							.unbind('mousedown')
							.mousedown(function(e) {
								if (!jQuery(e.target).hasClass(jS.cl.barTop)) {
									jS.evt.barMouseDown.first = jS.evt.barMouseDown.last = jS.colLast = jS.getBarTopIndex(e.target);
									jS.evt.barMouseDown.select(o, e, selectColumn, jS.columnResizer);
								}
								
								return false;
							});
						if (s.editable) { //only let editable select
							selectColumn = function(o) {
								if (!jQuery(o).attr('id')) {
									var i = jS.getBarTopIndex(o);
									
									jS.colLast = i; //keep track of last column for inserting new columns
									jS.evt.barMouseDown.last = i;
									
									jS.cellSetActiveBar('col', jS.evt.barMouseDown.first, jS.evt.barMouseDown.last);
								}
							};
						}
					}
				}
			},
			isTd: function(o) { /* ensures the the object selected is actually a td that is in a sheet
									o: object, cell object;
								*/
				o = (o[0] ? o[0] : [o]);
				if (o[0]) {
					if (!isNaN(o[0].cellIndex)) { 
						return true;
					}
				}
				return false;
			},
			isFormulaEditable: function(o) { /* ensures that formula attribute of an object is editable
													o: object, td object being used as cell
											*/
				if (s.lockFormulas) {
					if(o.attr('formula') !== undefined) {
						return false;
					}
				}
				return true;
			},
			toggleFullScreen: function() { /* toggles full screen mode */
				if (jS.obj.fullScreen().is(':visible')) { //here we remove full screen
					jQuery('body').removeClass('bodyNoScroll');
					s.parent = origParent;
					
					var w = s.parent.width();
					var h = s.parent.height();
					s.width = w;
					s.height = h;
					
					jS.obj.tabContainer().insertAfter(
						s.parent.append(jS.obj.fullScreen().children())
					).removeClass(jS.cl.tabContainerFullScreen);
					
					jS.obj.fullScreen().remove();
					
					jS.sheetSyncSize();
				} else { //here we make a full screen
					jQuery('body').addClass('bodyNoScroll');
					
					var w = $window.width() - 15;
					var h = $window.height() - 35;
					
					
					s.width = w;
					s.height = h;
					
					jS.obj.tabContainer().insertAfter(
						jQuery('<div class="' + jS.cl.fullScreen + ' ' + jS.cl.uiFullScreen + '" />')
							.append(s.parent.children())
							.appendTo('body')
					).addClass(jS.cl.tabContainerFullScreen);
					
					s.parent = jS.obj.fullScreen();
					
					jS.sheetSyncSize();
				}
			},
			tuneTableForSheetUse: function(o) { /* makes table object usable by sheet
													o: object, table object;
												*/
				o
					.addClass(jS.cl.sheet)
					.attr('id', jS.id.sheet + jS.i)
					.attr('border', '1px')
					.attr('cellpadding', '0')
					.attr('cellspacing', '0');
					
				o.find('td.' + jS.cl.cellActive).removeClass(jS.cl.cellActive);
				
				return o;
			},
			attrH: {/* Attribute Helpers
						I created this object so I could see, quickly, which attribute was most stable.
						As it turns out, all browsers are different, thus this has evolved to a much uglier beast
					*/
				width: function(o, skipCorrection) {
					return jQuery(o).outerWidth() - (skipCorrection ? 0 : s.boxModelCorrection);
				},
				widthReverse: function(o, skipCorrection) {
					return jQuery(o).outerWidth() + (skipCorrection ? 0 : s.boxModelCorrection);
				},
				height: function(o, skipCorrection) {
					return jQuery(o).outerHeight() - (skipCorrection ? 0 : s.boxModelCorrection);
				},
				heightReverse: function(o, skipCorrection) {
					return jQuery(o).outerHeight() + (skipCorrection ? 0 : s.boxModelCorrection);
				},
				syncSheetWidthFromTds: function(o) {
					var w = 0;
					o = (o ? o : jS.obj.sheet());
					o.find('col').each(function() {
						w += jQuery(this).width();
					});
					o.width(w);
					return w;
				},
				setHeight: function(i, from, skipCorrection, o) {
					var correction = 0;
					var h = 0;
					var fn;
					
					switch(from) {
						case 'cell':
							o = (o ? o : jS.obj.barLeft().find('div').eq(i));
							h = jS.attrH.height(jQuery(jS.getTd(jS.i, i, 0)).parent().andSelf(), skipCorrection);
							break;
						case 'bar':
							if (!o) {
								var tr = jQuery(jS.getTd(jS.i, i, 0)).parent();
								var td = tr.children();
								o = tr.add(td);
							} 
							h = jS.attrH.heightReverse(jS.obj.barLeft().find('div').eq(i), skipCorrection);
							break;
					}
					
					if (h) {
						jQuery(o)
							.height(h)
							.css('height', h + 'px')
							.attr('height', h + 'px');
					}

					return o;
				}
			},
			setTdIds: function(o) { /* cycles through all the td in a sheet and sets their id so it can be quickly referenced later
										o: object, cell object;
									*/
				o = (o ? o : jS.obj.sheet());
				o.find('tr').each(function(row) {
					jQuery(this).find('td,th').each(function(col) {
						jQuery(this).attr('id', jS.getTdId(jS.i, row, col));
					});
				});
			},
			setControlIds: function() { /* resets the control ids, useful for when adding new sheets/controls between sheets/controls :) */
				var resetIds = function(o, id) {
					o.each(function(i) {
						jQuery(this).attr('id', id + i);
					});
				};
				
				resetIds(jS.obj.sheetAll().each(function() {
					jS.setTdIds(jQuery(this));
				}), jS.id.sheet);
				
				resetIds(jS.obj.barTopAll(), jS.id.barTop);
				resetIds(jS.obj.barTopParentAll(), jS.id.barTopParent);
				resetIds(jS.obj.barLeftAll(), jS.id.barLeft);
				resetIds(jS.obj.barLeftParentAll(), jS.id.barLeftParent);
				resetIds(jS.obj.barCornerAll(), jS.id.barCorner);
				resetIds(jS.obj.barCornerParentAll(), jS.id.barCornerParent);
				resetIds(jS.obj.tableControlAll(), jS.id.tableControl);
				resetIds(jS.obj.paneAll(), jS.id.pane);
				resetIds(jS.obj.tabAll().each(function(j) {
					jQuery(this).attr('i', j);
				}), jS.id.tab);
			},
			columnResizer: { /* used for resizing columns */
				xyDimension: 0,
				getIndex: function(o) {
					return jS.getBarTopIndex(o);
				},
				getSize: function(o) {
					return jS.attrH.width(o, true);
				},
				setSize: function(o, v) {
					o.width(v);
				},
				setDesinationSize: function(w) {
					jS.sheetSyncSizeToDivs();
					
					jS.obj.sheet().find('col').eq(this.i)
						.width(w)
						.css('width', w)
						.attr('width', w);
					
					jS.obj.pane().scroll();
				},
				cursor: 'w-resize'
			},
			rowResizer: { /* used for resizing rows */
				xyDimension: 1,
					getIndex: function(o) {
						return jS.getBarLeftIndex(o);
					},
					getSize: function(o) {
						return jS.attrH.height(o, true);
					},
					setSize: function(o, v) {
						if (v) {
						o
							.height(v)
							.css('height', v)
							.attr('height', v);
						}
						return jS.attrH.height(o);
					},
					setDesinationSize: function() {
						//Set the cell height
						jS.attrH.setHeight(this.i, 'bar', true);
						
						//Reset the bar height if the resized row don't match
						jS.attrH.setHeight(this.i, 'cell', false);
						
						jS.obj.pane().scroll();
					},
					cursor: 's-resize'
			},
			toggleHide: {//These are not ready for prime time
				row: function(i) {
					if (!i) {//If i is empty, lets get the current row
						i = jS.obj.cellActive().parent().attr('rowIndex');
					}
					if (i) {//Make sure that i equals something
						var o = jS.obj.barLeft().find('div').eq(i);
						if (o.is(':visible')) {//This hides the current row
							o.hide();
							jS.obj.sheet().find('tr').eq(i).hide();
						} else {//This unhides
							//This unhides the currently selected row
							o.show();
							jS.obj.sheet().find('tr').eq(i).show();
						}
					} else {
						alert(jS.msg.toggleHideRow);
					}
				},
				rowAll: function() {
					jS.obj.sheet().find('tr').show();
					jS.obj.barLeft().find('div').show();
				},
				column: function(i) {
					if (!i) {
						i = jS.obj.cellActive().attr('cellIndex');
					}
					if (i) {
						//We need to hide both the col and td of the same i
						var o = jS.obj.barTop().find('div').eq(i);
						if (o.is(':visible')) {
							jS.obj.sheet().find('tbody tr').each(function() {
								jQuery(this).find('td,th').eq(i).hide();
							});
							o.hide();
							jS.obj.sheet().find('colgroup col').eq(i).hide();
							jS.toggleHide.columnSizeManage();
						}
					} else {
						alert(jS.msg.toggleHideColumn);
					}
				},
				columnAll: function() {
				
				},
				columnSizeManage: function() {
					var w = jS.obj.barTop().width();
					var newW = 0;
					var newW = 0;
					jS.obj.barTop().find('div').each(function() {
						var o = jQuery(this);
						if (o.is(':hidden')) {
							newW += o.width();
						}
					});
					jS.obj.barTop().width(w);
					jS.obj.sheet().width(w);
				}
			},
			offsetFormulaRange: function(row, col, rowOffset, colOffset, isBefore) {/* makes cell formulas increment in a range
																						row: int;
																						col: int;
																						rowOffset: int, offsets row increment;
																						colOffset: int, offsets col increment;
																						isBefore: bool, makes increment backward;
																					*/
				var shiftedRange = {
					first: [(row ? row : 0), (col ? col : 0)],
					last: jS.sheetSize()
				};
				
				if (!isBefore && rowOffset) { //this shift is from a row
					shiftedRange.first[0]++;
					shiftedRange.last[0]++;
				}
				
				if (!isBefore && colOffset) { //this shift is from a col
					shiftedRange.first[1]++;
					shiftedRange.last[1]++;
				}
				
				function isInFormula(loc) {
					if ((loc[0] - 1) >= shiftedRange.first[0] &&
						(loc[1] - 1) >= shiftedRange.first[1] &&
						(loc[0] - 1) <= shiftedRange.last[0] &&
						(loc[1] - 1) <= shiftedRange.last[1]
					) {
						return true;
					} else {
						return false;
					}
				}
				
				function isInFormulaRange(startLoc, endLoc) {
					if (
						(
							(startLoc[0] - 1) >= shiftedRange.first[0] &&
							(startLoc[1] - 1) >= shiftedRange.first[1]
						) && (
							(startLoc[0] - 1) <= shiftedRange.last[0] &&
							(startLoc[1] - 1) <= shiftedRange.last[1]
						) && (
							(endLoc[0] - 1) >= shiftedRange.first[0] &&
							(endLoc[1] - 1) >= shiftedRange.first[1]
						) && (
							(endLoc[0] - 1) <= shiftedRange.last[0] &&
							(endLoc[1] - 1) <= shiftedRange.last[1]
						)
					) {
						return true;
					} else {
						return false;
					}
				}
				

			},
			cycleCellsAndMaintainPoint: function(fn, firstLoc, lastLoc) { /* cylces through a certain group of cells in a spreadsheet and applies a function to them, firstLoc can be bigger then lastLoc, this is more dynamic
																			fn: function, the function to apply to a cell;
																			firstLoc: array of int - [col, row], the group to start;
																			lastLoc: array of int - [col, row], the group to end;
																		*/
				var o = [];
				for (var i = (firstLoc[0] < lastLoc[0] ? firstLoc[0] : lastLoc[0]) ; i <= (firstLoc[0] > lastLoc[0] ? firstLoc[0] : lastLoc[0]); i++) {
					for (var j = (firstLoc[1] < lastLoc[1] ? firstLoc[1] : lastLoc[1]); j <= (firstLoc[1] > lastLoc[1] ? firstLoc[1] : lastLoc[[1]]); j++) {
						o.push(jS.getTd(jS.i, i, j));
						fn(o[o.length - 1]);
					}
				}
				return o;
			},
			addTab: function() { /* Adds a tab for navigation to a spreadsheet */
				jQuery('<span class="' + jS.cl.uiTab + ' ui-corner-bottom">' + 
						'<a class="' + jS.cl.tab + '" id="' + jS.id.tab + jS.i + '" i="' + jS.i + '">' + jS.sheetTab(true) + '</a>' + 
					'</span>')
						.insertBefore(
							jS.obj.tabContainer().find('span:last')
						);
			},
			sheetDecorate: function(o) { /* preps a table for use as a sheet;
											o: object, table object;
										*/
				jS.formatSheet(o);
				jS.sheetSyncSizeToCols(o);
				jS.sheetDecorateRemove();
			},
			formatSheet: function(o) { /* adds tbody, colgroup, heights and widths to different parts of a spreadsheet
											o: object, table object;
										*/
				var tableWidth = 0;
				if (o.find('tbody').length < 1) {
					o.wrapInner('<tbody />');
				}
				
				if (o.find('colgroup').length < 1 || o.find('col').length < 1) {
					o.remove('colgroup');
					var colgroup = jQuery('<colgroup />');
					o.find('tr:first').find('td,th').each(function() {
						var w = s.newColumnWidth;
						jQuery('<col />')
							.width(w)
							.css('width', (w) + 'px')
							.attr('width', (w) + 'px')
							.appendTo(colgroup);
						
						tableWidth += w;
					});
					o.find('tr').each(function() {
						jQuery(this)
							.height(s.colMargin)
							.css('height', s.colMargin + 'px')
							.attr('height', s.colMargin + 'px');
					});
					colgroup.prependTo(o);
				}
				
				o
					.removeAttr('width')
					.css('width', '')
					.width(tableWidth);
			},
			checkMinSize: function(o) { /* ensure sheet minimums have been met, if not add columns and rows
											o: object, table object;
										*/
				var loc = jS.sheetSize();
				
				var addRows = 0;
				var addCols = 0;
				
				if ((loc[1]) < s.minSize.cols) {
					addCols = s.minSize.cols - loc[1] - 1;
				}
				
				if (addCols) {
					jS.controlFactory.addColumnMulti(addCols, false, true);
				}
				
				if ((loc[0]) < s.minSize.rows) {
					addRows = s.minSize.rows - loc[0] - 1;
				}
				
				if (addRows) {
					jS.controlFactory.addRowMulti(addRows, false, true);
				}
			},
			themeRoller: { /* jQuery ui Themeroller integration	*/
				start: function() {
					//Style sheet			
					s.parent.addClass(jS.cl.uiParent);
					jS.obj.sheet().addClass(jS.cl.uiSheet);
					//Style bars
					jS.obj.barLeft().find('div').addClass(jS.cl.uiBar);
					jS.obj.barTop().find('div').addClass(jS.cl.uiBar);
					jS.obj.barCornerParent().addClass(jS.cl.uiBar);
					
					jS.obj.controls().addClass(jS.cl.uiControl);
					jS.obj.label().addClass(jS.cl.uiControl);
					jS.obj.formula().addClass(jS.cl.uiControlTextBox);
				},
				cell: {
					setActive: function() {
						this.clearActive();
						this.setHighlighted(
							jS.cellLast.td
								.addClass(jS.cl.cellActive)
						);
					},
					setHighlighted: function(td) {
						jQuery(td)
							.addClass(jS.cl.cellHighlighted + ' ' + jS.cl.uiCellHighlighted);
					},
					clearActive: function() {
						jS.obj.cellActive()
							.removeClass(jS.cl.cellActive);
					},
					clearHighlighted: function() {
						jS.obj.cellHighlighted()
							.removeClass(jS.cl.cellHighlighted + ' ' + jS.cl.uiCellHighlighted);
						
						jS.highlightedLast.rowStart = -1;
						jS.highlightedLast.colStart = -1;
						jS.highlightedLast.rowEnd = -1;
						jS.highlightedLast.colEnd = -1;
					}
				},
				bar: {
					style: function(o) {
						jQuery(o).addClass(jS.cl.uiBar);
					},
					setActive: function(direction, i) {
						//We don't clear here because we can have multi active bars
						switch(direction) {
							case 'top': jS.obj.barTop().find('div').eq(i).addClass(jS.cl.uiActive);
								break;
							case 'left': jS.obj.barLeft().find('div').eq(i).addClass(jS.cl.uiActive);
								break;
						}
					},
					clearActive: function() {
						jS.obj.barTop().add(jS.obj.barLeft()).find('div.' + jS.cl.uiActive)
							.removeClass(jS.cl.uiActive);
					}
				},
				tab: {
					setActive: function(o) {
						this.clearActive();
						jS.obj.tab().parent().addClass(jS.cl.uiTabActive);
					},
					clearActive: function () {
						jS.obj.tabContainer().find('span.' + jS.cl.uiTabActive)
							.removeClass(jS.cl.uiTabActive);
					}
				}
			},
			resizable: function(o, settings) { /* jQuery ui resizeable integration
													o: object, any object that neds resizing;
													settings: object, the settings used with jQuery ui resizable;
												*/
				if (jQuery.ui && s.resizable) {
					if (o.attr('resizable')) {
						o.resizable("destroy");
					}
					
					o
						.resizable(settings)
						.attr('resizable', true);
				}
			},
			manageHtmlToText: function(v) { /* converts html to text for use in textareas
												v: string, value to convert;
											*/
				v = jQuery.trim(v);
				v = v.replace(/&nbsp;/g, ' ')
					.replace(/&gt;/g, '>')
					.replace(/&lt;/g, '<')
					.replace(/\t/g, '')
					.replace(/\n/g, '')
					.replace(/<br>/g, '\r')
					.replace(/<BR>/g, '\n');

					//jS.log("from html to text");
				return v;
			},
			manageTextToHtml: function(v) {	/* converts text to html for use in any object, probably a td/cell
												v: string, value to convert;
											*/
				v = jQuery.trim(v);
				v = v.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
					.replace(/ /g, '&nbsp;')
					.replace(/>/g, '&gt;')
					.replace(/</g, '&lt;')
					.replace(/\n/g, '<br>')
					.replace(/\r/g, '<br>');
					
					//jS.log("from text to html");
				return v;
			},
			sheetDecorateRemove: function(makeClone) { /* removes sheet decorations
															makesClone: bool, creates a clone rather than the actual object;
														*/
				var o = (makeClone ? jS.obj.sheetAll().clone() : jS.obj.sheetAll());
				
				//Get rid of highlighted cells and active cells
				jQuery(o).find('td.' + jS.cl.cellActive)
					.removeClass(jS.cl.cellActive + ' ' + jS.cl.uiCellActive);
					
				jQuery(o).find('td.' + jS.cl.cellHighlighted)
					.removeClass(jS.cl.cellHighlighted + ' ' + jS.cl.uiCellHighlighted);
				/*
				//IE Bug, match width with css width
				jQuery(o).find('col').each(function(i) {
					var v = jQuery(this).css('width');
					v = ((v + '').match('px') ? v : v + 'px');
					jQuery(o).find('col').eq(i).attr('width', v);
				});
				*/
				return o;
			},
			labelUpdate: function(v, setDirect) { /* updates the label so that the user knows where they are currently positioned
													v: string or array of ints, new location value;
													setDirect: bool, converts the array of a1 or [0,0] to "A1";
												*/
				if (!setDirect) {
					jS.obj.label().html((v[0] + 1)+'x'+(v[1] + 1)+' = ');
				} else {
					jS.obj.label().html(v);
				}
			},
			cellEdit: function(td, isDrag) { /* starts cell to be edited
												td: object, td object;

												isDrag: bool, should be determained by if the user is dragging their mouse around setting cells;
												*/
				//This finished up the edit of the last cell
				jS.evt.cellEditDone();
				jS.followMe(td);
				var loc = jS.getTdLocation(td);
				
				//Show where we are to the user
				jS.labelUpdate(loc);
				
				var v = td.attr('formula');
				if (!v) {
					v = jS.manageHtmlToText(td.html());
				}
				
				jS.obj.formula()
					.val(v)
					.focus()
					.select();
				jS.cellSetActive(td, loc, isDrag);
			},
			cellSetActive: function(td, loc, isDrag, directional, fnDone) { /* cell cell active to sheet, and highlights it for the user
																				td: object, td object;
																				loc: array of ints - [col, row];
																				isDrag: bool, should be determained by if the user is dragging their mouse around setting cells;
																				directional: bool, makes highlighting directional, only left/right or only up/down;
																				fnDone: function, called after the cells are set active;
																			*/
				if (typeof(loc[1]) != 'undefined') {
					jS.cellLast.td = td; //save the current cell/td
					
					jS.cellLast.row = jS.rowLast = loc[0];
					jS.cellLast.col = jS.colLast = loc[1];
					
					jS.themeRoller.bar.clearActive();
					jS.themeRoller.cell.clearHighlighted();
					
					jS.highlightedLast.td = td;
					
					jS.themeRoller.cell.setActive(); //themeroll the cell and bars
					jS.themeRoller.bar.setActive('left', jS.cellLast.row);
					jS.themeRoller.bar.setActive('top', jS.cellLast.col);
					
					var selectModel;
					var clearHighlightedModel;
					
					jS.highlightedLast.rowStart = loc[0];
					jS.highlightedLast.colStart = loc[1];
					jS.highlightedLast.rowLast = loc[0];
					jS.highlightedLast.colLast = loc[1];
					
					switch (s.cellSelectModel) {
						case 'excel':
						case 'gdocs':
							selectModel = function() {};
							clearHighlightedModel = jS.themeRoller.cell.clearHighlighted;
							break;
						case 'oo':
							selectModel = function(target) {
								var td = jQuery(target);
								if (jS.isTd(td)) {
									jS.cellEdit(td);
								}
							};
							clearHighlightedModel = function() {};
							break;
					}
					
					if (isDrag) {
						var lastLoc = loc; //we keep track of the most recent location because we don't want tons of recursion here
						jS.obj.pane()
							.mousemove(function(e) {
								var endLoc = jS.getTdLocation([e.target]);
								var ok = true;
								
								if (directional) {
									ok = false;
									if (loc[1] == endLoc[1] || loc[0] == endLoc[0]) {
										ok = true;
									}
								}
								
								if ((lastLoc[1] != endLoc[1] || lastLoc[0] != endLoc[0]) && ok) { //this prevents this method from firing too much
									//clear highlighted cells if needed
									clearHighlightedModel();
									
									//set current bars
									jS.highlightedLast.colEnd = endLoc[1];
									jS.highlightedLast.rowEnd = endLoc[0];
									
									//select active cell if needed
									selectModel(e.target);
									
									//highlight the cells
									jS.highlightedLast.td = jS.cycleCellsAndMaintainPoint(jS.themeRoller.cell.setHighlighted, loc, endLoc);
								}
								
								lastLoc = endLoc;
							});
						
						jQuery(document)
							.one('mouseup', function() {
	
								jS.obj.pane()
									.unbind('mousemove')
									.unbind('mouseup');
								
								if (jQuery.isFunction(fnDone)) {
									fnDone();
								}
							});
					}
				}
			},
			colLast: 0, /* the most recent used column */
			rowLast: 0, /* the most recent used row */
			cellLast: { /* the most recent used cell */
				td: jQuery('<td />'), //this is a dud td, so that we don't get errors
				row: -1,
				col: -1,
				isEdit: false
			}, /* the most recent highlighted cells */
			highlightedLast: {
				td: jQuery('<td />'),
				rowStart: -1,
				colStart: -1,
				rowEnd: -1,
				colEnd: -1
			},
			fontReSize: function (direction) { /* resizes fonts in a cell by 1 pixel
													direction: string, "up" || "down"
												*/
				var resize=0;
				switch (direction) {
					case 'up':
						resize=1;
						break;
					case 'down':
						resize=-1;
						break;    
				}
				
				//Lets check to remove any style classes
				var uiCell = jS.obj.cellHighlighted();
				
				jS.cellUndoable.add(uiCell);
				
				uiCell.each(function(i) {
					cell = jQuery(this);
					var curr_size = (cell.css("font-size") + '').replace("px","")
					var new_size = parseInt(curr_size ? curr_size : 10) + resize;
					cell.css("font-size", new_size + "px");
				});
				
				jS.cellUndoable.add(uiCell);
			},
			context: {},
			refreshLabelsColumns: function(){ /* reset values inside bars for columns */
				var w = 0;
				jS.obj.barTop().find('div').each(function(i) {
					jQuery(this).text(i+1);
					w += jQuery(this).width();
				});
				return w;
			},
			refreshLabelsRows: function(){ /* resets values inside bars for rows */
				jS.obj.barLeft().find('div').each(function(i) {
					jQuery(this).text((i + 1));
				});
			},
			addSheet: function(size) { /* adds a spreadsheet
											size: string example "10x100" which means 10 columns by 100 rows;
										*/
				size = (size ? size : prompt(jS.msg.newSheet));
				if (size) {
					jS.evt.cellEditAbandon();
					jS.setDirty(true);
					var newSheetControl = jS.controlFactory.sheetUI(jQuery.sheet.makeTable.fromSize(size), jS.sheetCount + 1, function(o) { 
						jS.setActiveSheet(jS.sheetCount);
					}, true);
				}
			},
			deleteSheet: function() { /* removes the currently selected sheet */
				jS.obj.tableControl().remove();
				jS.obj.tabContainer().children().eq(jS.i).remove();
				jS.i = 0;
				jS.sheetCount--;
				
				jS.setControlIds();
				
				jS.setActiveSheet(jS.i);
				s.fnAfterTabChanged(jS);
			},
			deleteRow: function() { /* removes the currently selected row */
				var v = confirm(jS.msg.deleteRow);
				if (v) {
					jS.obj.barLeft().find('div').eq(jS.rowLast).remove();
					jS.obj.sheet().find('tr').eq(jS.rowLast).remove();
					
					jS.evt.cellEditAbandon();
					
					jS.setTdIds();
					jS.refreshLabelsRows();
					jS.obj.pane().scroll();
					
					jS.rowLast = -1;
					
					jS.offsetFormulaRange(jS.rowLast, 0, -1, 0);
				}		
			},
			deleteColumn: function() { /* removes the currently selected column */
				var v = confirm(jS.msg.deleteColumn);
				if (v) {
					jS.obj.barTop().find('div').eq(jS.colLast).remove();
					jS.obj.sheet().find('colgroup col').eq(jS.colLast).remove();
					jS.obj.sheet().find('tr').each(function(i) {
							jQuery(this).find('td').eq(jS.colLast).remove();
					});
					
					jS.evt.cellEditAbandon();
					
					var w = jS.refreshLabelsColumns();
					jS.setTdIds();
					jS.obj.sheet().width(w);
					jS.obj.pane().scroll();
					
					jS.colLast = -1;
					
					jS.offsetFormulaRange(0, jS.colLast, 0, -1);
				}		
			},
			sheetTab: function(get) { /* manages a tabs inner value
											get: bool, makes return the current value of the tab;
										*/
				var sheetTab = '';
				if (get) {
					sheetTab = jS.obj.sheet().attr('title');
					if (!sheetTab)
					{
						sheetTab = 'Matris ' + (parseInt(jS.i) + 1);
						jS.obj.sheet().attr('title', sheetTab);
						jS.obj.sheet().attr('act', '');
					}
				} else if (s.editable) { //ensure that the sheet is editable, then let them change the sheet's name
					var newTitle = prompt("Matrisin yeni etiketi ne olsun? (Maksimum 8 karakter)", jS.sheetTab(true));
					if (!newTitle) { //The user didn't set the new tab name
						newTitle = (sheetTab ? sheetTab.substring(0,8) : 'Matris ' + (jS.i + 1));
					} else {
						titleArray = newTitle.split(":",2);
						if (titleArray.length == 2)
						{
							if (titleArray[0] == "TERS" || titleArray[0] == "DET" || titleArray[0] == "TRANS")
							{
								jS.obj.sheet().attr('act', titleArray[0]);
							}
							else
							{
								jS.obj.sheet().attr('act', '');
							}
							newTitle = titleArray[1].substring(0,8);
						}
						else
						{
							newTitle = titleArray[0].substring(0,8);
						}
						jS.setDirty(true);
						jS.obj.sheet().attr('title', newTitle);
						jS.obj.tab().html(newTitle);
						sheetTab = newTitle;
					}
				}
				s.fnAfterTabChanged(jS);
				return sheetTab;
			},
			print: function(o) { /* prints a value in a new window
									o: string, any string;
								*/
				var w = window.open();
				w.document.write("<html><body><xmp>" + o + "\n</xmp></body></html>");
				w.document.close();
			},
			followMe: function(td) { /* scrolls the sheet to the selected cell
										td: object, td object;
									*/
				td = (td ? td : jQuery(jS.cellLast.td));
				var pane = jS.obj.pane();
				var panePos = pane.offset();
				var paneWidth = pane.width();
				var paneHeight = pane.height();

				var tdPos = td.offset();
				var tdWidth = td.width();
				var tdHeight = td.height();
				
				var margin = 20;
				
				//jS.log('td: [' + tdPos.left + ', ' + tdPos.top + ']');
				//jS.log('pane: [' + panePos.left + ', ' + panePos.top + ']');
				
				if ((tdPos.left + tdWidth + margin) > (panePos.left + paneWidth)) { //right
					pane.stop().scrollTo(td, {
						axis: 'x',
						duration: 50,
						offset: - ((paneWidth - tdWidth) - margin)
					});
				} else if (tdPos.left < panePos.left) { //left
					pane.stop().scrollTo(td, {
						axis: 'x',
						duration: 50
					});
				}
				
				if ((tdPos.top + tdHeight + margin) > (panePos.top + paneHeight)) { //bottom
					pane.stop().scrollTo(td, {
						axis: 'y',
						duration: 50,
						offset: - ((paneHeight - tdHeight) - margin)
					});
				} else if (tdPos.top < panePos.top) { //top
					pane.stop().scrollTo(td, {
						axis: 'y',
						duration: 50
					});
				}
				
			},
			isRowHeightSync: [],
			setActiveSheet: function(i) { /* sets active a spreadsheet inside of a sheet instance 
											i: int, a sheet integer desired to show;
											*/
				i = (i ? i : 0);

				jS.obj.tableControlAll().hide().eq(i).show();
				jS.i = i;			
				
				jS.themeRoller.tab.setActive();
				
				if (!jS.isRowHeightSync[i]) { //this makes it only run once, no need to have it run every time a user changes a sheet
					jS.isRowHeightSync[i] = true;
					jS.obj.sheet().find('tr').each(function(j) {
						jS.attrH.setHeight(j, 'cell');
						/*
						fixes a wired bug with height in chrome and ie
						It seems that at some point during the sheet's initializtion the height for each
						row isn't yet clearly defined, this ensures that the heights for barLeft match 
						that of each row in the currently active sheet when a user uses a non strict doc type.
						*/
					});
				}
				
				jS.sheetSyncSize();
				//jS.replaceWithSafeImg();
			},
			openSheet: function(o, reloadBarsOverride) { /* opens a spreadsheet into the active sheet instance \
															o: object, a table object;
															reloadBarsOverride: if set to true, foces bars on left and top not be reloaded;
														*/
				if (!jS.isDirty ? true : confirm(jS.msg.openSheet)) {
					jS.controlFactory.header();
					
					var fnAfter = function(i, l) {
						if (i == (l - 1)) {
							jS.i = 0;
							jS.setActiveSheet();
							s.fnAfter();
						}
					};
					var sheets = jQuery('<div />').html(o).children('table');
					sheets.show().each(function(i) {
						jS.controlFactory.sheetUI(jQuery(this), i,  function() { 
							fnAfter(i, sheets.length);
						}, (reloadBarsOverride ? true : false));
					});
					
					jS.setDirty(false);
					
					return true;
				} else {
					return false;
				}
			},
			newSheet: function() { /* creates a new shet from size */
				var size = prompt(jS.msg.newSheet);
				if (size) {
					jS.openSheet(jQuery.sheet.makeTable.fromSize(size));
				}
			},
			importRow: function(rowArray) { /* creates a new row and then applies an array's values to each of it's new values
												rowArray: array;
											*/
				jS.controlFactory.addRow(null, null, ':last');

				var error = "";
				jS.obj.sheet().find('tr:last td').each(function(i) {
					jQuery(this).removeAttr('formula');
					try {
						//To test this, we need to first make sure it's a string, so converting is done by adding an empty character.
						if ((rowArray[i] + '').charAt(0) == "=") {
							jQuery(this).attr('formula', rowArray[i]);					
						} else {
							jQuery(this).html(rowArray[i]);
						}
					} catch(e) {
						//We want to make sure that is something bad happens, we let the user know
						error += e + ';\n';
					}
				});
				
				if (error) {//Show them the errors
					alert(error);
				}
				//Let's recalculate the sheet just in case
				jS.setTdIds();
			},
			importColumn: function(columnArray) { /* creates a new column and then applies an array's values to each of it's new values
													columnArray: array;
												*/
				jS.controlFactory.addColumn();

				var error = "";
				jS.obj.sheet().find('tr').each(function(i) {
					var o = jQuery(this).find('td:last');
					try {
						//To test this, we need to first make sure it's a string, so converting is done by adding an empty character.
						if ((columnArray[i] + '').charAt(0) == "=") {
							o.attr('formula', columnArray[i]);					
						} else {
							o.html(columnArray[i]);
						}
					} catch(e) {
						//We want to make sure that is something bad happens, we let the user know
						error += e + ';\n';
					}
				});
				
				if (error) {//Show them the errors
					alert(error);
				}
				//Let's recalculate the sheet just in case
				jS.setTdIds();
			},
			exportSheet: {
				json: function() {
					var sheetClone = jS.sheetDecorateRemove(true);
					var documents = []; //documents
					
					jQuery(sheetClone).each(function() {
						var document = {}; //document
						document['metadata'] = {};
						document['data'] = {};
						
						var table = jQuery(this);
						
						var trs = table.find('tr');
						var rowCount = trs.length;
						var colCount = 0;
						var col_widths = '';
						
						trs.each(function(i) {
							var tr = jQuery(this);
							var tds = tr.find('td');
							colCount = tds.length;
							
							document['data'][i] = {};
							//document['data']['r' + i]['h'] = tr.attr('height');
							
							tds.each(function(j) {
								var td = jQuery(this);
								//var colSpan = td.attr('colspan');
								//colSpan = (colSpan > 1 ? colSpan : null);
								// var formula = td.attr('formula');
								/*
								document['data']['r' + i]['c' + j] = {
									'value': (formula ? formula : td.text()),
									 //'style': td.attr('style'),
									 // 'colspan': colSpan,
									 //'cl': td.attr('class')
								};
								*/
								document['data'][i][j] = td.text();
							});
						});
						document['metadata'] = {
							'columns': colCount, //length is 1 based, index is 0 based
							'rows': rowCount, //length is 1 based, index is 0 based
							'act': table.attr('act'),
							'title': table.attr('title')
							//'col_widths': {}
						};
						/*
						table.find('colgroup').children().each(function(i) {
							document['metadata']['col_widths']['c' + i] = (jQuery(this).attr('width') + '').replace('px', '');
						});
						*/
						documents.push(document); //append to documents
					});
					return documents;
				}
			},
			sheetSyncSizeToDivs: function() { /* syncs a sheet's size from bars/divs */
				var newSheetWidth = 0;
				jS.obj.barTop().find('div').each(function() {
					newSheetWidth += parseInt(jQuery(this).outerWidth());
				});
				jS.obj.sheet().width(newSheetWidth);
			},
			sheetSyncSizeToCols: function(o) { /* syncs a sheet's size from it's col objects
													o: object, sheet object;
												*/
				var newSheetWidth = 0;
				o = (o ? o : jS.obj.sheet());
				o.find('colgroup col').each(function() {
					newSheetWidth += jQuery(this).width();
				});
				o.width(newSheetWidth);
			},
			sheetSyncSize: function() { /* syncs a sheet's size to that of the jQuery().sheet() caller object */
				var h = s.height;
				if (!h) {
					h = 400; //Height really needs to be set by the parent
				} else if (h < 200) {
					h = 200;
				}
				s.parent
					.height(h)
					.width(s.width);
					
				var w = s.width - jS.attrH.width(jS.obj.barLeftParent()) - (s.boxModelCorrection);
				
				h = h - jS.attrH.height(jS.obj.controls()) - jS.attrH.height(jS.obj.barTopParent()) - (s.boxModelCorrection * 2);
				
				jS.obj.pane()
					.height(h)
					.width(w)
					.parent()
						.width(w);
				
				jS.obj.ui()
					.width(w + jS.attrH.width(jS.obj.barLeftParent()));
						
				jS.obj.barLeftParent()
					.height(h);
				
				jS.obj.barTopParent()
					.width(w)
					.parent()
						.width(w);
			},
			cellChangeStyle: function(style, value) { /* changes a cell's style and makes it undoable/redoable
														style: string, css style name;
														value: string, css setting;
													*/
				jS.cellUndoable.add(jS.obj.cellHighlighted()); //save state, make it undoable
				jS.obj.cellHighlighted().css(style, value);
				jS.cellUndoable.add(jS.obj.cellHighlighted()); //save state, make it redoable

			},
			cellFind: function(v) { /* finds a cell in a sheet from a value
										v: string, value in a cell to find;
									*/
				if(!v) {
					v = prompt("Aradığınız kelimeyi girin?");
				}
				if (v) {//We just do a simple uppercase/lowercase search.
					var o = jS.obj.sheet().find('td:contains("' + v + '")');
					
					if (o.length < 1) {
						o = jS.obj.sheet().find('td:contains("' + v.toLowerCase() + '")');
					}
					
					if (o.length < 1) {
						o = jS.obj.sheet().find('td:contains("' + v.toUpperCase() + '")');
					}
					
					o = o.eq(0);
					if (o.length > 0) {
						jS.cellEdit(o);
					} else {
						alert(jS.msg.cellFind);
					}
				}
			},
			cellSetActiveBar: function(type, start, end) { /* sets a bar active
																type: string, "col" || "row" || "all";
																start: int, int to start highlighting from;
																start: int, int to end highlighting to;
															*/
				var loc = jS.sheetSize();
				var first = (start < end ? start : end);
				var last = (start < end ? end : start);
				
				var setActive = function(td, rowStart, colStart, rowFollow, colFollow) {
					switch (s.cellSelectModel) {
						case 'oo': //follow cursor behavior
							jS.cellEdit(jQuery(jS.getTd(jS.i, rowFollow, colFollow)));
							break;
						default: //stay at initial cell
							jS.cellEdit(jQuery(jS.getTd(jS.i, rowStart, colStart)));
							break;
					}
					
					setActive = function(td) { //save resources
						return td;
					};
					
					return td;
				};

				var cycleFn;

				var td = [];
				
				switch (type) {
					case 'col':
						cycleFn = function() {
							for (var i = 0; i <= loc[0]; i++) { //rows
								for (var j = first; j <= last; j++) { //cols
									td.push(jS.getTd(jS.i, i, j));
									jS.themeRoller.cell.setHighlighted(setActive(td[td.length - 1], 0, start, 0, end));
								}
							}
						};
						break;
					case 'row':
						cycleFn = function() {
							for (var i = first; i <= last; i++) { //rows
								for (var j = 0; j <= loc[1]; j++) { //cols
									td.push(jS.getTd(jS.i, i, j));
									jS.themeRoller.cell.setHighlighted(setActive(td[td.length - 1], start, 0, end, 0));
								}
							}
						};
						break;
					case 'all':
						cycleFn = function() {
							setActive = function(td) {
								jS.cellEdit(jQuery(td));
								setActive = function() {};
							};
							for (var i = 0; i <= loc[0]; i++) {
								for (var j = 0; j <= loc[1]; j++) {
									td.push(jS.getTd(jS.i, i, j));
									setActive(td[td.length - 1]);
									jS.themeRoller.cell.setHighlighted(td[td.length - 1]);
								}
							}
							first = [0, 0];
							last = loc;
						};
						break;
				}
				
				cycleFn();
				
				jS.highlightedLast.td = td;
				jS.highlightedLast.rowStart = first[0];
				jS.highlightedLast.colStart = first[1];
				jS.highlightedLast.rowEnd = last[0];
				jS.highlightedLast.colEnd = last[1];
			},
			sheetClearActive: function() { /* clears formula and bars from being highlighted */
				jS.obj.formula().val('');
				jS.obj.barSelected().removeClass(jS.cl.barSelected);
			},
			getTdId: function(tableI, row, col) { /* makes a td if from values given
													tableI: int, table integer;
													row: int, row integer;
													col: int, col integer;
												*/
				return I + '_table' + tableI + '_cell_c' + col + '_r' + row;
			},
			getTd: function(tableI, row, col) { /* gets a td
													tableI: int, table integer;
													row: int, row integer;
													col: int, col integer;
												*/
				return document.getElementById(jS.getTdId(tableI, row, col));
			},
			getTdLocation: function(td) { /* gets td column and row int
												td: object, td object;
											*/
				var col = parseInt(td[0].cellIndex);
				var row = parseInt(td[0].parentNode.rowIndex);
				return [row, col];
				// The row and col are 1-based.
			},
			getTdFromXY: function(left, top, skipOffset) { /* gets cell from point
																left: int, pixels left;
																top: int, pixels top;
																skipOffset: bool, skips pane offset;
															*/
				var pane = jS.obj.pane();
				var paneOffset = (skipOffset ? {left: 0, top: 0} : pane.offset());
				
				top += paneOffset.top + 2;
				left += paneOffset.left + 2;
				
				//here we double check that the coordinates are inside that of the pane, if so then we can continue
				if ((top >= paneOffset.top && top <= paneOffset.top + pane.height()) &&
					(left >= paneOffset.left && left <= paneOffset.left + pane.width())) {
					var td = jQuery(document.elementFromPoint(left - $window.scrollLeft(), top - $window.scrollTop()));
					
					
					//I use this snippet to help me know where the point was positioned
					/*jQuery('<div class="ui-widget-content" style="position: absolute;">TESTING TESTING</div>')
						.css('top', top + 'px')
						.css('left', left + 'px')
						.appendTo('body');
					*/
					
					if (jS.isTd(td)) {
						return td;
					}
					return false;
				}
			},
			getBarLeftIndex: function(o) { /* get's index from object */
				var i = jQuery.trim(jQuery(o).text());
				return parseInt(i) - 1;
			},
			getBarTopIndex: function(o) { /* get's index from object */
				var i = jQuery.trim(jQuery(o).text());
				return parseInt(i) - 1;
			},
			EMPTY_VALUE: {},
			time: { /* time loggin used with jS.log, useful for finding out if new methods are faster */
				now: new Date(),
				last: new Date(),
				diff: function() {
					return Math.abs(Math.ceil(this.last.getTime() - this.now.getTime()) / 1000).toFixed(5);
				},
				set: function() {
					this.last = this.now;
					this.now = new Date();
				},
				get: function() {
					return this.now.getHours() + ':' + this.now.getMinutes() + ':' + this.now.getSeconds();
				}
			},
			log: function(msg) {  //The log prints: {Current Time}, {Seconds from last log};{msg}
				jS.time.set();
				jS.obj.log().prepend(jS.time.get() + ', ' + jS.time.diff() + '; ' + msg + '<br />\n');
			},			
			isDirty:  false,
			setDirty: function(dirty) { jS.isDirty = dirty; },
			appendToFormula: function(v, o) {
				var formula = jS.obj.formula();
				
				var fV = formula.val();
				
				if (fV.charAt(0) != '=') {
					fV = '=' + fV;
				}
				
				formula.val(fV + v);
			},
			cellUndoable: { /* makes cell editing undoable and redoable */
				undoOrRedo: function(undo) {

					
					if (!undo && this.i > 0) {
						this.i--;
					} else if (undo && this.i < this.stack.length) {
						this.i++;
					}
					
					this.get().clone().each(function() {
						var o = jQuery(this);
						var id = o.attr('undoable');
						if (id) {
							jQuery('#' + id).replaceWith(
								o
									.removeAttr('undoable')
									.attr('id', id)
							);
						} else {
							jS.log('Not available.');
						}
					});
					
					jS.themeRoller.cell.clearActive();
					jS.themeRoller.bar.clearActive();
					jS.themeRoller.cell.clearHighlighted();
				},
				get: function() { //gets the current cell
					return jQuery(this.stack[this.i]);
				},
				add: function(tds) {
					var oldTds = tds.clone().each(function() {
						var o = jQuery(this);
						var id = o.attr('id');
						o
							.removeAttr('id') //id can only exist in one location, on the sheet, so here we use the id as the attr 'undoable'
							.attr('undoable', id)
							.removeClass(jS.cl.cellHighlighted + ' ' + jS.cl.uiCellHighlighted);
					});
					if (this.stack.length > 0) {
						this.stack.unshift(oldTds);
					} else {
						this.stack = [oldTds];
					}
					this.i = -1;
					if (this.stack.length > 20) { //undoable count, we want to be careful of too much memory consumption
						this.stack.pop(); //drop the last value
					}
				},
				i: 0,
				stack: []
			},
			sheetSize: function() {
				return jS.getTdLocation(jS.obj.sheet().find('td:last'));
			},
			toggleState:  function(replacementSheets) {
				if (s.allowToggleState) {
					if (s.editable) {
						jS.evt.cellEditAbandon();
						jS.saveSheet();
					}
					jS.setDirty(false);
					s.editable = !s.editable;
					jS.obj.tabContainer().remove();
					var sheets = (replacementSheets ? replacementSheets : jS.obj.sheetAll().clone());
					origParent.children().remove();
					jS.openSheet(sheets, true);
				}
			},
			setCellRef: function(ref) {
				var td = jS.obj.cellActive();
				var cellRef = td.attr('cellRef');
				td.removeClass(cellRef);
				
				cellRef = (ref ? ref : prompt('Enter the name you would like to reference the cell by.'));
				
				if (cellRef) {
					td
						.addClass(cellRef)
						.attr('cellRef', cellRef);
				}
			}
		};
		
		var $window = jQuery(window);
		
		//initialize this instance of sheet
		jS.s = s;
		
		s.fnBefore();
		
		var o; var emptyFN = function() {};
		if (s.buildSheet) {//override urlGet, this has some effect on how the topbar is sized
			if (typeof(s.buildSheet) == 'object') {
				o = s.buildSheet;
			} else if (s.buildSheet == true || s.buildSheet == 'true') {
				o = jQuery(s.parent.html());
			} else if (s.buildSheet.match(/x/i)) {
				o = jQuery.sheet.makeTable.fromSize(s.buildSheet);
			}
		}
		
		//We need to take the sheet out of the parent in order to get an accurate reading of it's height and width
		//jQuery(this).html(s.loading);
		s.parent
			.html('')
			.addClass(jS.cl.parent);
		
		//Use the setting height/width if they are there, otherwise use parent's
		s.width = (s.width ? s.width : s.parent.width());
		s.height = (s.height ? s.height : s.parent.height());
		
		
		// Drop functions if they are not needed & save time in recursion
		if (s.log) {
			s.parent.after('<textarea id="' + jS.id.log + '" class="' + jS.cl.log + '" />');
		} else {
			jS.log = emptyFN;
		}
		
		if (!jQuery.support.boxModel) {
			s.boxModelCorrection = 0;
		}
		
		if (!jQuery.scrollTo) {
			jS.followMe = emptyFN;
		}
		
		jS.log('Startup');
		
		$window
		.resize(function() {
			if (jS) { //We check because jS might have been killed
				s.width = s.parent.width();
				s.height = s.parent.height();
				jS.sheetSyncSize();
			}
		});
		
		jS.openSheet(o, s.forceColWidthsOnStartup);
		
		return jS;
	},
	makeTable : {
		json: function(data, makeEval) { /* creates a sheet from json data, for format see top
											data: json;
											makeEval: bool, if true evals json;
										*/
			sheet = (makeEval == true ? eval('(' + data + ')') : data);
			
			var tables = jQuery('<div />');
			
			for (var i = 0; i < sheet.length; i++) {
				var colCount = parseInt(sheet[i].metadata.columns);
				var rowCount = parseInt(sheet[i].metadata.rows);
				title = sheet[i].metadata.title;
				title = (title ? title : "Matris " + (i+1));
			
				var table = jQuery("<table />");
				var tableWidth = 0;
				var colgroup = jQuery('<colgroup />').appendTo(table);
				var tbody = jQuery('<tbody />');
				
				//go ahead and make the cols for colgroup
				for (var x = 0; x < colCount; x++) {
					var w = 40;
					colgroup.append('<col width="' + w + 'px" style="width: ' + w + 'px;" />');
				}
				
				table
					.attr('title', title)
					.attr('act', '')
					.width(colCount*40);
				
				for (var x = 0; x < rowCount; x++) { //tr
					var tr = jQuery('<tr />').appendTo(table);
					tr.attr('height', (sheet[i]['data']['r' + x].h ? sheet[i]['data']['r' + x].h : 18));
					
					for (var y = 0; y < colCount; y++) { //td
						var cell = sheet[i]['data']['r' + x]['c' + y];
						var cur_val;
						
						if (cell) {
							cur_val = cell;
						}
						else
						{
							cur_val = '';
						}

						var cur_td = jQuery('<td/>');
						try {
							cur_td.html(cur_val);
						} catch (e) {}
					
						tr.append(cur_td);

					}
				}
				
				tables.append(table);
			}
			return tables.children();
		},
		fromSize: function(size, h, w) { /* creates a spreadsheet object from a size given 
											size: string, example "10x100" which means 10 columns by 100 rows;
											h: int, height for each new row;
											w: int, width of each new column;
										*/
			if (!size) {
				size = "5x10";
			}
			size = size.toLowerCase().split('x');
			if (size.length == 2)
			{
				var columnsCount = parseInt(size[0]);
				var rowsCount = parseInt(size[1]);
				
				//Create elements before loop to make it faster.
				var newSheet = jQuery('<table />');
				var standardTd = '<td></td>';
				var tds = '';
				
				//Using -- is many times faster than ++
				for (var i = columnsCount; i >= 1; i--) {
					tds += standardTd;
				}

				var standardTr = '<tr' + (h ? ' height="' + h + 'px" style="height: ' + h + 'px;"' : '') + '>' + tds + '</tr>';
				var trs = '';
				for (var i = rowsCount; i >= 1; i--) {
					trs += standardTr;
				}
				
				newSheet.html('<tbody>' + trs + '</tbody>');
				
				if (w) {
					newSheet.width(columnsCount * w);
				}
				
				return newSheet;
			}
			
		}
	},
	killAll: function() { /* removes all sheets */
		if (jQuery.sheet) {
			if (jQuery.sheet.instance) {
				for (var i = 0; i < jQuery.sheet.instance.length; i++) {
					if (jQuery.sheet.instance[i]) {
						if (jQuery.sheet.instance[i].kill) {
							jQuery.sheet.instance[i].kill();
						}
					}
				}
			}
		}
	},
	paneScrollLocker: function(obj, I) { //This can be used with setting fnPaneScroll to lock all loaded sheets together when scrolling, useful in history viewing
		jQuery(jQuery.sheet.instance).each(function(i) {
			this.obj.pane()
				.scrollLeft(obj.scrollLeft())
				.scrollTop(obj.scrollTop());
		});
	},
	switchSheetLocker: function(I) { //This can be used with setting fnSwitchSheet to locks sheets together when switching, useful in history viewing
		jQuery(jQuery.sheet.instance).each(function(i) {
			this.setActiveSheet(I);
		});
	}
};

var key = { /* key objects, makes it easier to develop */
	BACKSPACE: 			8,
	CAPS_LOCK: 			20,
	COMMA: 				188,
	CONTROL: 			17,
	ALT:				18,
	DELETE: 			46,
	DOWN: 				40,
	END: 				35,
	ENTER: 				13,
	ESCAPE: 			27,
	HOME: 				36,
	INSERT: 			45,
	LEFT: 				37,
	NUMPAD_ADD: 		107,
	NUMPAD_DECIMAL: 	110,
	NUMPAD_DIVIDE: 		111,
	NUMPAD_ENTER: 		108,
	NUMPAD_MULTIPLY: 	106,
	NUMPAD_SUBTRACT: 	109,
	PAGE_DOWN: 			34,
	PAGE_UP: 			33,
	PERIOD: 			190,
	RIGHT: 				39,
	SHIFT: 				16,
	SPACE: 				32,
	TAB: 				9,
	UP: 				38,
	F:					70,
	V:					86,
	Y:					89,
	Z:					90
};

var arrHelpers = {
	foldPrepare: function(firstArg, theArguments, unique) { // Computes the best array-like arguments for calling fold().
		var result;
		if (firstArg != null &&
			firstArg instanceof Object &&
			firstArg["length"] != null) {
			result = firstArg;
		} else {
			result = theArguments;
		}
		
		if (unique) {
			result = this.unique(result);
		}
		
		return result;
	},
	fold: function(arr, funcOfTwoArgs, result, castToN, N) {
		for (var i = 0; i < arr.length; i++) {
			result = funcOfTwoArgs(result, (castToN == true ? N(arr[i]): arr[i]));
		}
		return result;
	},
	toNumbers: function(arr) {
		arr = jQuery.makeArray(arr);
		
		for (var i = 0; i < arr.length; i++) {
			if (jQuery.isArray(arr[i])) {
				arr[i] = this.toNumbers(arr[i]);
			} else if (arr[i]) {
				if (isNaN(arr[i])) {
					arr[i] = 0;
				}
			} else {
				arr[i] = 0;
			}
		}
		
		return arr;
	},
	unique: function(arr) {
		var a = [];
		var l = arr.length;
		for (var i=0; i<l; i++) {
			for(var j=i+1; j<l; j++) {
				// If this[i] is found later in the array
				if (arr[i] === arr[j])
					j = ++i;
			}
			a.push(arr[i]);
		}
		return a;
	}
};

jQuery.fn.extend({ 
        disableSelection : function() { 
                this.each(function() { 
                        this.onselectstart = function() { return false; }; 
                        this.unselectable = "on"; 
                        jQuery(this).css('-moz-user-select', 'none'); 
                }); 
        } 
});