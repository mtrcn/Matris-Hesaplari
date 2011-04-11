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
					  if (i==5) formul+="<br/>";
					  i++;
					});
					$("#formul").html(formul);
				 }
                 });

            });
			
			function calculate()
			{
				req['matrix'] = jQuery.sheet.instance[0].exportSheet.json();
				//alert(jQuery.sheet.instance[0].kill());
				//console.log(jt.length);
				var i = 0;
				var row = 0;
				var column = 0;
				req['formula'] = {mat:{},opt:{}};
				for(i = 0; i < req['matrix'].length; i++)
				{
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
							result = eval("("+result+")");
						}
				);
				
				
			}

			function isNumber(text)
			{
  				var ValidChars = "0123456789.";
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
			
			function fromJson()
			{
				var table = jQuery.sheet.makeTable.json(req,false);
				jQuery.sheet.instance[0].openSheet(table,true);
			}
            
            //This function builds the inline menu to make it easy to interact with each sheet instance
            function inlineMenu(instance){
                var I = (instance ? instance.length : 0);
                
                //we want to be able to edit the html for the menu to make them multi-instance
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
			style="height: 70px; width: 645px;">
		<div class="ui-widget-header ui-corner-top">Hesap Formülü</div>
		<div id="formul" style="margin: 5px"></div>
		</div>
		<div style="text-align: center"><input type="button"
			value="Hesapla" onClick="calculate()"> <input type="button"
			value="Kaydet" onClick="fromJson()"></div>
		</td>
	</tr>
</table>
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
	alt="Ara" src="<?php echo base_url(); ?>images/icons/find.png" /> </a> <a href="#"
	onclick="sheetInstance.toggleFullScreen(); $('#lockedMenu').toggle(); return false;"
	title="Tam Ekran"> <img alt="Tam Ekran"
	src="<?php echo base_url(); ?>images/icons/arrow_out.png" /> </a> </span> </span>
</body>
</html>