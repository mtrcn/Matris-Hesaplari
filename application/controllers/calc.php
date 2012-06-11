<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Calc extends CI_Controller {

	function __construct()
	{
		parent::__construct();
		$this->load->library('gupa');
		$this->load->model('MatrixModel', '', TRUE);
	}

	function index()
	{
		if (!$this->gu_session->isLogged()) die("Erişim Yetkiniz Yok!");
		$this->load->view('calc');
	}
	
	/**
	* Kaydedilmiş projeleri getirir
	*/
	function getProjects()
	{
		if (!$this->gu_session->isLogged()) die("Erişim Yetkiniz Yok!");
		$projects = $this->MatrixModel->getProjects();
		if ($projects->num_rows()==0)
		{
			echo '
			<div class="ui-state-highlight">
				<p>
					<span class="ui-icon ui-icon-info" style="float:left; padding: 1px;"></span>
					Henüz kayıtlı bir projeniz yok.
				</p>
			</div>
			';
		}else
		{
			echo '<label for="pid">Açmak istediğiniz projeyi listeden seçin:</label>';
			echo '<select id="pid" style="width:100%">';
			foreach ($projects->result() as $item) {
				echo '<option value="'.$item->pid.'">'.$item->tag.'</option>';
			}
			echo '</select>';
		}
	}
	
	/**
	* Kaydedilmiş projeyi getirir
	*/
	function load()
	{
		if (!$this->gu_session->isLogged()) die("Erişim Yetkiniz Yok!");
		$pid = trim($this->input->post('pid',TRUE));
		if (empty($pid))
		{
			die("Proje no eksik!");
		}
		$project = $this->MatrixModel->getProject($pid);
		if ($project==null)
		{
			die("Proje bulunamadı!");
		}else
		{
			echo $project['params'];
		}
	}
	
	/**
	* Matris hesabını daha sonra çalışmak üzere kaydeder.
	*/
	function save()
	{
		if (!$this->gu_session->isLogged()) die("Erişim Yetkiniz Yok!");
		$tag = trim($this->input->post('tag',TRUE));
		if (empty($tag))
		{
			echo '
			<div class="ui-state-error ui-corner-all">
				<p>
					<span class="ui-icon ui-icon-alert" style="float:left; padding: 1px;"></span>
					Lütfen etiket alanını boş bırakmayın.
				</p>
			</div>
			';
			exit();
		}
		$postParams = $this->input->post('params');
		$params = json_decode($postParams, TRUE);
		if ($params!=null)
		{
			$isExist = $this->MatrixModel->isExist($tag);
			if ($isExist)
			{
				echo 'Daha önce bu etiketle başka bir proje kaydetmişsiniz.';
			}else
			{
				$saveData=array(
					'uid' => $this->gu_session->getUID(),
					'date' => time(),
					'tag' => $tag,
					'params' => $postParams
				);
				$this->MatrixModel->save($saveData); 
				echo 'Projeniz başarıyla kaydedildi.';
			}
		}
		else
		{
			echo 'Kayıt verisi formatı doğrulanamıyor.';
			exit();
		}
	}
	
	function evaluate(){
		if (!$this->gu_session->isLogged()) die("Erişim Yetkiniz Yok!");
		$postReq = $this->input->post('req');
		$req = json_decode($postReq, TRUE);
		$var = array();
		$result = null;
		$i = 0;
		if ($req!=null)
		{
			foreach($req['matrix'] as $matrix)
			{
	             
				if($matrix['metadata']['act'] == "")
	             {
	             	$var[$i++] = $matrix['data'];
	             	continue;
	             }
	             else
	             {
	             	switch ($matrix['metadata']['act'])
	             	{
	             		//TODO: Hata Olursa Mesaj Verecek!	
	             		case 'DET':
	             			$result = $var[$i++]=$this->MatrixModel->det($matrix['data']);
	             			break;
	             		case 'TRAN':
	             			$result = $var[$i++]=$this->MatrixModel->tran($matrix['data']);
	             			break;
	             		case 'TERS':
	             			$result = $var[$i++]=$this->MatrixModel->inv($matrix['data']);
	             			break;
	             	}
	             }
			}
			$opts = count($req['formula']['opt']);
			if ($opts>0)
			{
				$mults = array();
				$sums  = array();
				$mins  = array();
				for ($i = 0; $i < $opts; $i++) {
					switch ($req['formula']['opt'][$i]) {
						case 'multiply':
							$mults[] = $i;
							break;
						case 'minus':
							$mins[] = $i;
							break;
						case 'sum':
							$sums[] = $i;
							break;
					}
				}
				
				foreach ($mults as $val) {
					if ($val > 0)
					{
						$result = $var[$val] = $this->MatrixModel->times($var[$val],$var[$val+1]);
					}else
					{
						$result = $var[$val+1] = $this->MatrixModel->times($var[$val],$var[$val+1]);
					}
				}
				
				foreach ($sums as $val) {
					$result = $var[$val+1] = $this->MatrixModel->sum($var[$val],$var[$val+1]);
				}
				
				foreach ($mins as $val) {
					$result = $var[$val+1] = $this->MatrixModel->minus($var[$val],$var[$val+1]);
				}
			}
			if (!isset($result['errorMessage']))
			{
				$result = array(
							'data' => is_array($result)?$result:array(array($result)), 
							'metadata' => array(
										'rows'=>count($result),
										'columns'=>is_array($result[0])?count($result[0]):1,
										'title' => '',
										'act' => ''
										)
						);
				echo json_encode($result);
			}
			else
			{
				echo "error";
			}
		}
		else
		{
			die("Hatalı JSON Biçimi");
		}
	}
}