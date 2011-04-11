<h1><?php echo $user->name.' '.$user->surname; ?></h1>
<fieldset>
<legend>Lisans Bilgileriniz</legend>
<?php 
if ($license->error_code!=0)
{
	echo '<div id="warning">Lisans doğrulama hatası :'.$license->error_code.'</div>';
}else{
	echo '<b>Başlama Tarihi:</b> '. date('d/m/Y',$license->start_date);
	echo ' | <b>Bitiş Tarihi:</b> '. date('d/m/Y',$license->expire_date);
}
?>	
</fieldset>
</div>