<?php
/**
 * MatrixModel Class
 *
 * Matris hesabı işlemleri
 *
 * @author Mete Ercan Pakdil
 */
class MatrixModel extends CI_Model {

	function __construct()
	{
		parent::__construct();
	}
	
	/**
	 * Tüm proje verilerini veritabanından yükler
	 *
	 * @return Object
	 */
	function getProjects()
	{
		$result = $this->db->where('uid',$this->gu_session->getUID())->get('projects');
		if ($result==null)
		{
			return null;
		}
		return $result;
	}
	
	/**
	 * Proje verilerini veritabanından yükler
	 *
	 * @param Integer $pid proje no (gerekli)
	 * @return Array
	 */
	function getProject($pid)
	{
		$dbResult = $this->db->where('pid',$pid)->where('uid',$this->gu_session->getUID())->get('projects')->row();
		if ($dbResult==null)
		{
			return null;
		}
		$result = array(
			'params' => $dbResult->params,
		);
		return $result;
	}
	
	/**
	 * Proje daha önce kayıtlı mı kontrol eder
	 *
	 * @param String $tag proje etiketi (gerekli)
	 * @return Boolean
	 */
	function isExist($tag){
		$isExist=$this->db->where('uid',$this->gu_session->getUID())->where('tag',$tag)->get('projects')->num_rows();
		if ($isExist)
		{
			return TRUE;
		}else
		{
			return FALSE;
		}
	}
	
	/**
	 * Yeni proje kayıt eder
	 *
	 * @param Array $data proje verileri (gerekli)
	 * @return Boolean
	 */
	function save($data){
		return $this->db->insert('projects',$data);
	}
	
	/**
	 * Kayıtlı projeyi siler
	 *
	 * @param Integer $pid proje no (gerekli)
	 * @return Boolean
	 */
	function delete($pid)
	{
		$dbResult = $this->db->where('pid',$pid)->where('uid',$this->gu_session->getUID())->delete('projects');
		return $dbResult;
	}
	
	function det($matrix){
		$params=array(
			'matrix_a'=>json_encode($matrix)
		);
		$result=json_decode($this->gupa->api('/matrix/det/',$params,NULL),TRUE);
		if ($result == null)
		{
			$data['errorMessage']="GUPA ile iletişim kurulamadı!";
			return $data;
		}
		if (isset($result['det']))
		{
			return json_decode($result['det']);
		}else
		{
			$data['errorMessage']=$this->gupaErrorMessage($result['error_code']);
			return $data;
		}
	}
	
	function tran($matrix){
		$params=array(
			'matrix_a'=>json_encode($matrix)
		);
		$result=json_decode($this->gupa->api('/matrix/transpose/',$params,NULL),TRUE);
		if ($result == null)
		{
			$data['errorMessage']="GUPA ile iletişim kurulamadı!";
			return $data;
		}
		if (isset($result['matrix']))
		{
			return json_decode($result['matrix']);
		}else
		{
			$data['errorMessage']=$this->gupaErrorMessage($result['error_code']);
			return $data;
		}
	}
	
	function inv($matrix){
		$params=array(
			'matrix_a'=>json_encode($matrix)
		);
		$result=json_decode($this->gupa->api('/matrix/inverse/',$params,NULL),TRUE);
		if ($result == null)
		{
			$data['errorMessage']="GUPA ile iletişim kurulamadı!";
			return $data;
		}
		if (isset($result['matrix']))
		{
			return json_decode($result['matrix']);
		}else
		{
			$data['errorMessage']=$this->gupaErrorMessage($result['error_code']);
			return $data;
		}
	}
	
	function times($matrix_a, $matrix_b){
		$params=array(
			'matrix_a'=>json_encode($matrix_a),
			'matrix_b'=>json_encode($matrix_b)
		);
		print_r($params);
		$result=json_decode($this->gupa->api('/matrix/multiply/',$params,NULL),TRUE);
		if ($result == null)
		{
			$data['errorMessage']="GUPA ile iletişim kurulamadı!";
			return $data;
		}
		if (isset($result['matrix']))
		{
			return json_decode($result['matrix']);
		}else
		{
			$data['errorMessage']=$this->gupaErrorMessage($result['error_code']);
			return $data;
		}
	}
	
	function sum($matrix_a, $matrix_b){
		$params=array(
			'matrix_a'=>json_encode($matrix_a),
			'matrix_b'=>json_encode($matrix_b)
		);
		$result=json_decode($this->gupa->api('/matrix/sum/',$params,NULL),TRUE);
		if ($result == null)
		{
			$data['errorMessage']="GUPA ile iletişim kurulamadı!";
			return $data;
		}
		if (isset($result['matrix']))
		{
			return json_decode($result['matrix']);
		}else
		{
			$data['errorMessage']=$this->gupaErrorMessage($result['error_code']);
			return $data;
		}
	}
	
	function minus($matrix_a, $matrix_b){
		$params=array(
			'matrix_a'=>json_encode($matrix_a),
			'matrix_b'=>json_encode($matrix_b)
		);
		$result=json_decode($this->gupa->api('/matrix/minus/',$params,NULL),TRUE);
		if ($result == null)
		{
			$data['errorMessage']="GUPA ile iletişim kurulamadı!";
			return $data;
		}
		if (isset($result['matrix']))
		{
			return json_decode($result['matrix']);
		}else
		{
			$data['errorMessage']=$this->gupaErrorMessage($result['error_code']);
			return $data;
		}
	}

	
	/**
	 * GUPA servisinden gelen error_code parametresine göre hata mesajı üretir.
	 *
	 * @param Integer $code GUPA hata kodu (gerekli)
	 * @return String
	 */
	private function gupaErrorMessage($code){
		switch ($code) {
			case 100:
				return "Lütfen girdiğiniz sayısal değerlerin nokta ile ayrılmış ve sadece rakamlardan oluştuğuna emin olun";
				break;
					
			default:
				return $code.': Bilinmeyen bir hata oluştu!';
				break;
		}
	}
}