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
		$this->load->view('index');
	}
	
	function evaluate(){
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
			
			print_r($result);
		}
		else
		{
			die("Hatalı JSON Biçimi");
		}
	}
}