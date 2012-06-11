<?php
/**
 * User Class
 *
 * Üye işlemlerinin yapılabilmesi için metodlar içerir
 *
 * @author Mete Ercan Pakdil
 */
class User extends CI_Controller {

	/**
	* User sınıfını yükler.
	*/
	function __construct()
	{
		parent::__construct();
		$this->load->library('gupa');	
	}
	
	/**
	* Varsayılan olarak hiç bir metod tarayıcıdan çağırılmadığında gelecektir.
	*/
	function index()
	{
		if ($this->gu_session->isLogged())
		{
			redirect('calc');
		}else
		{
			$this->load->view('index');
		}
	}
	
	/**
	 * Google ile oturum aç
	 */
	function login_with_google()
	{
		$this->load->library('openid',array('host'=>base_url()));
		if(!$this->input->get('openid_mode')) {
			$this->openid->identity = 'https://www.google.com/accounts/o8/id';
			redirect($this->openid->authUrl());
		}
		elseif($_GET['openid_mode'] == 'cancel')
		{
			redirect('');
		}
		else {
			if($this->openid->validate()){
				$this->_login($_GET);
			}
			else{
				redirect('');
			}
		}
	}
	
	/**
	 * myOpenID ile oturum aç
	 */
	function login_with_myopenid()
	{
		$this->load->library('openid',array('host'=>base_url()));
		if(!$this->input->get('openid_mode')) {
			$this->openid->identity = 'https://www.myopenid.com/';
			redirect($this->openid->authUrl());
		}
		elseif($_GET['openid_mode'] == 'cancel')
		{
			redirect('');
		}
		else {
			if($this->openid->validate()){
				$this->_login($_GET);
			}
			else{
				redirect('');
			}
		}
	}
	
	
	/**
	 * OpenID sağlayıcısından gelen bilgilerle oturum açar
	 *
	 * @param Array $openid_data OpenID sağlayıcısından gelen bilgiler (gerekli)
	 */
	private function _login($openid_data)
	{
		$dbResult=$this->db->where('uid',$openid_data['openid_identity'])->get('users')->row();
		if ($dbResult==NULL){
			//Kullanıcı daha önce veritabanında yoksa veritabınında kullanıcı için yeni bir kayıt oluşturulur.
			$dbResult=$this->db->insert('users',array('uid'=>(string)$openid_data['openid_identity']));
			if (!$dbResult)
				show_error('Bilgileriniz veritabanına kaydedilemedi.<br>Lütfen tekrar deneyin.');
		}
		$this->session->set_userdata(array('uid' => $openid_data['openid_claimed_id']));
		redirect('calc');
	}
	
	/**
	 * Oturumu sonlandırır
	 *
	 */
	function logout()
	{
		if ($this->gu_session->isLogged()) {
			$this->session->sess_destroy();
		}
		redirect('');
	}
	
}