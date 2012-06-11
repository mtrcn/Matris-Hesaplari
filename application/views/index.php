<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Matris Hesapları</title>
<link rel="stylesheet" type="text/css" href="<?php echo base_url(); ?>css/bootstrap.min.css" />
<style type="text/css">
      body {
        padding-top: 60px;
        padding-bottom: 40px;
      }
</style>
<script type="text/javascript" src="<?php echo base_url(); ?>js/jquery-1.7.2.min.js"></script>
<script type="text/javascript" src="<?php echo base_url(); ?>js/bootstrap-dropdown.js"></script>
</head>
<body>
    <div class="navbar navbar-fixed-top">
	    <div class="navbar-inner">
		    <div class="container">
		    	    <a class="brand" href="#">Matris Hesapları</a>
		    	    <ul class="nav">
						<li class="dropdown">
			              <a data-toggle="dropdown" class="dropdown-toggle" href="#">Oturum Aç <b class="caret"></b></a>
			              <ul style="margin:0px" class="dropdown-menu">
			                <li><a href="<?php echo base_url(); ?>user/login_with_google">Google ile Oturum Açın</a></li>
				    		<li><a href="<?php echo base_url(); ?>user/login_with_myopenid">myOpenID ile Oturum Açın</a></li>
			              </ul>
			            </li>
				</ul>
		    </div>
	    </div>
    </div>
    <div class="container">
<script type="text/javascript">
	    function subscribe(form){
	        if ($("#email").val()=="")
	        {
	            alert("e-Posta alanını boş bırakamazsınız!");
	        }else
	        {
	        	$.post(
	        		"<?php echo base_url(); ?>emaillist/subscribe", 
	        		$("#SubscribtionForm").serialize(),
	        		function(result){
	        		    $("#SubscribtionResult").html(result);
	        		}
	        	);
	        }
	    }
</script>
<ul class="thumbnails">
	<li class="span3">
		<div class="thumbnail">
			<img alt="Hoşgeldiniz" src="<?php echo base_url(); ?>images/welcome.png">
			<div class="caption">
				<h3>Hoşgeldiniz!</h3>
				<p>
					Matris Hesapları uygulamasına hoşgeldiniz, uygulamayı kullanabilmek 
					için oturum açmanız gerekiyor. Böylece yaptığınız hesapları kaydedebilir
					ve daha sonra tekrar kullanabilirsiniz. Ayrıca sizin için üç farklı tipte örnek 
					projeyi de biz ekliyoruz.
				</p>
				<div class="btn-group">
				    <a class="btn dropdown-toggle" data-toggle="dropdown" href="#">
				    Oturum Açın
				    <span class="caret"></span>
				    </a>
				    <ul class="dropdown-menu">
				    	<li><a href="<?php echo base_url(); ?>user/login_with_google">Google ile Oturum Açın</a></li>
				    	<li><a href="<?php echo base_url(); ?>user/login_with_myopenid">myOpenID ile Oturum Açın</a></li>
				    </ul>
		    	</div>
		    </div>
    	</div>
	</li>
	<li class="span3">
		<div class="thumbnail">
			<img alt="Özellikler" src="<?php echo base_url(); ?>images/features.png">
			<div class="caption">
				<h3>Özellikleri</h3>
				<ul>
					<li>Toplama, Çıkarma ve Çarpma işlemleri</li>
					<li>Matrisin tersini, transpoze ve determminantını alma</li>
					<li>Kolay kullanım için tasarlanan kullanıcı arayüzü</li>
					<li>İstenilen boyutta matris hesap tablosu oluşturma</li>
					<li>Microsoft Excel'e sonuçları aktarabilme</li>
					<li>Hesapları proje olarak kaydedebilme</li>
					<li>GUPA servisleri ile çalışır</li>
					<li>Üyelik gerektirmez</li>
					<li><b>ve her zaman ücretsiz!</b></li>
				</ul>
			</div>
		</div>
	</li>
	<li class="span3">
		<div class="thumbnail">
			<img alt="Açık Kaynak" src="<?php echo base_url(); ?>images/opensource.png">
			<div class="caption">
				<h3>Açık Kaynak Kod</h3>
				<p>Bu uygulama sizin istekleriniz için yetersiz mi kaldı?
					O zaman kaynak kodlarını indirin ve özel ihtiyaçlarınıza göre değiştirin.
				</p>
				<p>
					<a class="btn" href="http://github.com/mtrcn/Matris-Hesaplari">Kaynak Kodlara Ulaşın &raquo;</a>
				</p>
			</div>
		</div>
	</li>
	<li class="span3">
		<div class="thumbnail">
			<img alt="e-Posta Listesi" src="<?php echo base_url(); ?>images/emaillist.png">
			<div class="caption">
				<h3>Haberdar Olun</h3>
				<form id="SubscribtionForm">
					<input class="input-medium" type="text" name="email" placeholder="E-Posta Adresiniz...">
					<input class="btn" type="button" value="Kayıt Ol" onClick="subscribe(this.form)">			
				</form>
				<div id="SubscribtionResult"></div>
			</div>
		</div>
	</li>
</ul>
<hr>
	<div class="container" style="text-align: center;">
		<a href="http://www.geomates.net" target="_blank" title="Bir Geomates ailesi uygulamasıdır"><img src="<?php echo base_url();?>images/geomates.png"/></a>
	</div>
</div>
</body>
</html>