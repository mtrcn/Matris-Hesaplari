	<script type="text/javascript">
		function deleteProject(id)
		{
			if (confirm('Silmek istediğinize emin misiniz?'))
			{
				window.location='<?php echo site_url("levelling/delete"); ?>/'+id;
			}
		}
	</script>
  	<h1>Projeler</h1>
    Aşağıda daha önce kaydettiğiniz projeleri görüyorsunuz.
    <table id="list-table" width="100%">
    	<tr><th width="17%">Tarih</th><th width="15%">Nivelman Türü</th><th>Etiket</th><th width="18%">İşlemler</th></tr>
<?php
$title_tr=array('free' => 'Açık Nivelman','ring' => 'Kapalı Nivelman','closed' => 'Bağlı Nivelman');
if ($projects->num_rows()>0)
{
	foreach ($projects->result() as $project)
	{
?>
		<tr>
			<td><?php echo date('d.m.Y H:i',$project->date); ?></td>
			<td><?php echo $title_tr[$project->type]; ?></td>
			<td><?php echo $project->tag; ?></td>
			<td align="center">
				<input type="button" style="width:50px; text-align:center;" value="Aç" onClick="javascript:window.location='<?php echo site_url("levelling/open/".$project->pid); ?>'">
				<input type="button" style="width:50px; text-align:center;" value="Sil" onClick="deleteProject(<?php echo $project->pid; ?>)">
			</td>
		</tr>
<?php
	}
}else
{
?>
   		<tr><td colspan="4" align="center">Henüz kayıtlı bir projeniz yok, yeni bir proje oluşturmak için <a href="<?php echo site_url("levelling/new_project"); ?>">buraya tıklayın.</a></td></tr>
<?php 
}
?>
    </table>
	<div id="help">
		<div class="helpItem">
			<p>Kaydettiğiniz bir projeyi listeden açarak çalışmanıza devam edebilir veya silebilirsiniz.</p>
		</div>
	</div>
</div>