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
	
	function det($matrix){
		echo json_encode($matrix);
		$params=array(
			'matrix_a'=>json_encode($matrix)
		);
		$result=json_decode($this->gupa->api('/matrix/det/',$params,NULL),TRUE);
		if ($result == null)
		{
			$data['errorMessage']="GUPA ile iletişim kurulamadı!";
			return $data;
		}
		if ($result['error_code']==0)
		{
			return $result['det'];
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
		if ($result['error_code']==0)
		{
			return $result['matrix'];
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
		if ($result['error_code']==0)
		{
			return $result['matrix'];
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
		$result=json_decode($this->gupa->api('/matrix/multiply/',$params,NULL),TRUE);
		if ($result == null)
		{
			$data['errorMessage']="GUPA ile iletişim kurulamadı!";
			return $data;
		}
		if ($result['error_code']==0)
		{
			return $result['matrix'];
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
		if ($result['error_code']==0)
		{
			return $result['matrix'];
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
		if ($result['error_code']==0)
		{
			return $result['matrix'];
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