<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
<META HTTP-EQUIV="Pragma" CONTENT="no-cache">
<META HTTP-EQUIV="Expires" CONTENT="-1">
<meta http-equiv="content-type" content="text/html; charset=utf-8" />
<title>Matris Hesapları</title>
<link rel="stylesheet" type="text/css" href="<?php echo base_url(); ?>css/jquery.sheet.css" />
<link rel="stylesheet" type="text/css"	href="<?php echo base_url(); ?>js/jquery-ui/theme/jquery-ui.css" />
<script type="text/javascript" src="<?php echo base_url(); ?>js/jquery-1.5.2.min.js"></script>
<script type="text/javascript" src="<?php echo base_url(); ?>js/jquery.sheet.js"></script>
<script type="text/javascript" src="<?php echo base_url(); ?>js/jquery-ui/ui/jquery-ui.min.js"></script>
<script type="text/javascript" src="<?php echo base_url(); ?>js/json.js"></script>

<script type="text/javascript">
			var req = {};		

            $(function(){
                 if (navigator.appName == "Microsoft Internet Explorer") {
					$("body").html("IE Desteklemiyor!");
				}
                 $('#matrix').sheet({
                 inlineMenu: inlineMenu(jQuery.sheet.instance),
                 buildSheet: '2x2',
				 fnAfterTabChanged: function(js){
					var formul="";
					var i = 0;
					js.obj.sheetAll().each(function() {
					  formul+="<select id=\"mat_"+i+"\">";
					  var j = 0;
					  js.obj.sheetAll().each(function() {
						  if ($(this).attr("act")!="")
						  {
							formul+="<option value=\""+j+"\">"+$(this).attr("act")+"("+$(this).attr("title")+")</option>";
						  }
						  else
						  {
						    formul+="<option value=\""+j+"\">"+$(this).attr("title")+"</option>";
						  }
						  j++;
					  });
					  formul+="</select>";
					  if(i!=(js.obj.sheetAll().length-1))
						  formul+="<select id=\"opt_"+i+"\">"
						  +"<option value=\"sum\">+</option>"
						  +"<option value=\"minus\">-</option>"
						  +"<option value=\"multiply\">x</option>"
						  +"<option value=\"\">|</option>"
						  +"</select>";
					  i++;
					});
					$("#formul").html(formul);
				 }
                 });
            });
			
			function calculate()
			{
				req['matrix'] = jQuery.sheet.instance[0].exportSheet.json();
				var i = 0;
				var row = 0;
				var column = 0;
				req['formula'] = {mat:{},opt:{}};
				for(i = 0; i < req['matrix'].length; i++)
				{
					if (req['matrix'][i]['metadata']['act']=="TERS" && req['matrix'][i]['metadata']['columns'] > req['matrix'][i]['metadata']['rows'])
					{
						alert(req['matrix'][i]['metadata']['title']+" : Tersi alınacak matrisin sütun sayısı satır sayısından fazla olamaz!");
						return false;
					}
					for(row in req['matrix'][i]['data'])
					{
						for(column in req['matrix'][i]['data'][row])
						{
							//console.log(jt[i]['data'][row][column]);
							if (!isNumber(req['matrix'][i]['data'][row][column]))
							{
								alert(req['matrix'][i]['metadata']['title']+" : "+(parseInt(row)+1)+"x"+(parseInt(column)+1)+" hücresi numerik değil!");
								return false;
							}
						}
					}
					if (i > 0)
					{
						if ($('#opt_'+(i-1)).val() != "")
						{
							req['formula']['opt'][i-1] = $('#opt_'+(i-1)).val();
						}
						else
						{
							break;
						}
					}
					req['formula']['mat'][i] = $('#mat_'+i).val();
				}

				$.post(
						"<?php echo base_url(); ?>calc/evaluate", 
						{req: $.toJSON(req)},
						function(result){
							if (result!="error")
							{
								result = eval("("+result+")");
								jQuery.sheet.instance[0].importSheet([result]);
							}
							else
							{
								alert("İşlem hataya neden oldu!");
							}							
						}
				);
				
				
			}

			function exportTXT(instance){

				$("#txtExcel").val(instance.exportSheet.text());
				$( "#export-message" ).dialog({
					modal: true,
					width:400
				});

			}

			function isNumber(text)
			{
  				var ValidChars = "-0123456789.";
  				var IsNumber=true;
 				var Char;
 				if (text.length == 0)
 				{
 					IsNumber = false;
 				}
				for (i = 0; i < text.length && IsNumber == true; i++) 
 				{ 
     				Char = text.charAt(i); 
     				if (ValidChars.indexOf(Char) == -1) 
        			{
   	  					IsNumber=false;
        			}
     				//console.log(IsNumber);
     			}
  				return IsNumber;
			}
			
			function showSaveDialog()
			{
				$( "#save-message" ).dialog({
					modal: true,
					width:320,
					buttons: { 
						"Vazgeç": function() { $(this).dialog("close"); }, 
						"Kaydet": function() { 
								if ($("#txtTag").val()=="")
								{
									alert("Etiket alanı boş olamaz!");
									return false;
								}
								else
								{
									$.post(
											"<?php echo base_url(); ?>calc/save", 
											{params: $.toJSON(jQuery.sheet.instance[0].exportSheet.json()), tag: $("#txtTag").val()},
											function(result){
												alert(result);
												$( "#save-message" ).dialog("close");
											}
									);
								}
							} 
						}
				});
			}
			
			function showLoadDialog()
			{
				$.post(
						"<?php echo base_url(); ?>calc/getProjects",
						function(result){
							$("#load-message").html(result);
							$( "#load-message" ).dialog({
								modal: true,
								width:320,
								buttons: { 
									"Vazgeç": function() { $(this).dialog("close"); }, 
									"Aç": function() { 
											var pid = jQuery("#pid").val();
											if (pid){
												$.post(
														"<?php echo base_url(); ?>calc/load", 
														{pid:pid},
														function(result){
															result = eval("("+result+")");
															var table = jQuery.sheet.makeTable.json(result,false);
															jQuery.sheet.instance[0].openSheet(table,true);
															$( "#load-message").dialog("close");
														}
												);
											}
										} 
									}
							});
						}
				);	
			}

			function showHelpDialog()
			{
				$( "#help-message" ).dialog({
					modal: true,
					width:500,
					buttons: { 
						"Kapat": function() { $(this).dialog("close"); }
					}
				});
			}
            
            function inlineMenu(instance){
                var I = (instance ? instance.length : 0);
                
                var html = $('#inlineMenu').html().replace(/sheetInstance/g, "$.sheet.instance[" + I + "]");
                
                var menu = $(html);               
                
                return menu;
            }

</script>
<style>
body {
	background-color: #464646;
	padding: 0px;
	margin: 0px;
	padding-bottom: 100px;
	font-family: sans-serif;
	font-size: 13px;
	color: black;
}

.wrapper {
	margin: 10px auto;
	background-color: #CCCCCC;
	width: 655px;
	padding: 10px;
}
</style>
</head>
<body>
<div id="mainWrapper" class="ui-corner-all wrapper">
<table style="width: 100%;">
	<tr>
		<td colspan="2">
			<img src="<?php echo base_url(); ?>images/banner.png" border="0">
		</td>
	</tr>
	<tr>
		<td colspan="2" style="vertical-align: top;">
		<div id="matrix" style="height: 450px; width: 645px;"></div>
		</td>
	</tr>
	<tr>
		<td>
		<div class="ui-widget-content ui-corner-all"
			style="min-height: 70px; width: 645px;">
		<div class="ui-widget-header ui-corner-top">Hesap Formülü</div>
		<div id="formul" style="margin: 5px"></div>
		</div>
		<div style="text-align: center"><input type="button"
			value="Hesapla" onClick="calculate()"> <input type="button"
			value="Kaydet" onClick="showSaveDialog()"> <input type="button"
			value="Projelerim" onClick="showLoadDialog()">
		</td>
	</tr>
</table>
</div>
<div class="ui-corner-all wrapper" style="text-align:right;">
Geliştirici: <a href="http://www.geomatikuygulamalar.com/store/developer/2570140711" target="_blank" title="Mete Ercan Pakdil">Mete Ercan Pakdil</a>
</div>
<div id="export-message" title="Dışa Aktar" style="display: none;">
	<p>
		Bu kutu içindeki metni Excel çalışma sayfasına kopyalayarak aktarabilirsiniz.
		<textarea rows="10" cols="45" id="txtExcel"></textarea>
	</p>
</div>
<div id="save-message" title="Kaydet" style="display: none;">
	<p>
		<label for="txtTag">Bir etiket girin:<br/>
		<input id="txtTag" style="width:280px;"></label>
	</p>
</div>
<div id="help-message" title="Yardım" style="display: none; font-size:11px;">
	<p>
		<span class="ui-icon ui-icon-triangle-1-e" style="float:left; padding: 1px;"></span>
		<strong>Matris Üzerinde İşlem Yapmak İçin</strong><br/>
		Bir matrisi işleme sokmadan önce tersini, transpozesini veya determminantını almak istiyorsanız çalışma sayfası 
		altındaki sekmelerden işlem yapmak istediğiniz matrisin adına tıklayarak çıkan kutuda matris adının başına 
		<i>TERS, TRANS, DET</i> ifadelerinden birini ekleyin ve iki nokta üst üste ":" koyun.<br/>
		<strong>Örnek:</strong> "TRANS:Matris 1" ifadesi matrisin transpozesini alır.
	</p>
	<p>
		<span class="ui-icon ui-icon-triangle-1-e" style="float:left; padding: 1px;"></span>
		<strong>Microsoft Excel ile çalışmak için</strong><br/>
		Microsoft Excel'den matrisleri kopyalarak aynı boyutta burada oluşturulmuş bir matrise yapıştırbilirsiniz. 
		Aynı şekilde menüden "Dışa Aktar" ikonuna tıklayarak oluşturulan ham veriyi kopyalayarak Microsoft Excel'de çalışma sayfanızdaki
		herhangi bir hücreye tıklayarak yapıştırabilirsiniz. 
	</p>
</div>
<div id="load-message" title="Proje Aç" style="display: none;"></div>
<span id="inlineMenu" style="display: none;"> <span> <a
	href="#" onclick="sheetInstance.controlFactory.addRow(); return false;"
	title="Altına Satır Ekle"> <img alt="Altına Satır Ekle"
	src="<?php echo base_url(); ?>images/icons/sheet_row_add.png" /> </a> <a href="#"
	onclick="sheetInstance.controlFactory.addRow(null, true); return false;"
	title="Üstüne Satır Ekle"> <img alt="Üstüne Satır Ekle"
	src="<?php echo base_url(); ?>images/icons/sheet_row_add.png" /> </a> <a href="#"
	onclick="sheetInstance.controlFactory.addRow(null, null, ':last'); return false;"
	title="Sona Satır Ekle"> <img alt="Sona Satır Ekle"
	src="<?php echo base_url(); ?>images/icons/sheet_row_add.png" /> </a> <a href="#"
	onclick="sheetInstance.controlFactory.addRowMulti(); return false;"
	title="Birden Fazla Satır Ekle"> <img alt="Birden Fazla Satır Ekle"
	src="<?php echo base_url(); ?>images/icons/sheet_row_add_multi.png" /> </a> <a href="#"
	onclick="sheetInstance.deleteRow(); return false;" title="Satır Sil">
<img alt="Satır Sil" src="<?php echo base_url(); ?>images/icons/sheet_row_delete.png" /> </a> <a
	href="#"
	onclick="sheetInstance.controlFactory.addColumn(); return false;"
	title="Sağa Sütun Ekle"> <img alt="Sağa Sütun Ekle"
	src="<?php echo base_url(); ?>images/icons/sheet_col_add.png" /> </a> <a href="#"
	onclick="sheetInstance.controlFactory.addColumn(null, true); return false;"
	title="Sola Sütun Ekle"> <img alt="Sola Sütun Ekle"
	src="<?php echo base_url(); ?>images/icons/sheet_col_add.png" /> </a> <a href="#"
	onclick="sheetInstance.controlFactory.addColumn(null, null, ':last'); return false;"
	title="Sona Sütun Ekle"> <img alt="Sona Sütun Ekle"
	src="<?php echo base_url(); ?>images/icons/sheet_col_add.png" /> </a> <a href="#"
	onclick="sheetInstance.controlFactory.addColumnMulti(); return false;"
	title="Birden Fazla Sütun Ekle"> <img alt="Birden Fazla Sütun Ekle"
	src="<?php echo base_url(); ?>images/icons/sheet_col_add_multi.png" /> </a> <a href="#"
	onclick="sheetInstance.deleteColumn(); return false;" title="Sütun Sil">
<img alt="Sütun Sil" src="<?php echo base_url(); ?>images/icons/sheet_col_delete.png" /> </a> <a
	href="#" onclick="sheetInstance.deleteSheet(); return false;"
	title="Matris Sil"> <img alt="Matris Sil"
	src="<?php echo base_url(); ?>images/icons/table_delete.png" /> </a> <a href="#"
	onclick="sheetInstance.cellFind(); return false;" title="Ara"> <img
	alt="Ara" src="<?php echo base_url(); ?>images/icons/find.png" /> </a>
	 <a href="#"
	onclick="exportTXT(sheetInstance);" title="Dışa Aktar"> <img
	alt="Dışa Aktar" src="<?php echo base_url(); ?>images/icons/excel.png" /> </a> <a href="#"
	onclick="sheetInstance.toggleFullScreen(); return false;"
	title="Tam Ekran"> <img alt="Tam Ekran"
	src="<?php echo base_url(); ?>images/icons/arrow_out.png" /> </a> 	<a href="#"
	onclick="showHelpDialog();"
	title="Yardım"> <img alt="Yardım"
	src="<?php echo base_url(); ?>images/icons/help.png" /> </a></span> </span>
</body>
</html>