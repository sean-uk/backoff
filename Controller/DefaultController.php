<?php

/**
 * @todo a proper submission handler, ie; are there errors? stay on the current page
 * @todo one was pages you can't back past
 */

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class DefaultController extends Controller
{
    /**
     * @Route("/", name="homepage")
     * @Route("/page/{page_num}/")
     */
    public function indexAction(Request $request, $page_num=1)
    {
        $data = array(
            'page_num' => is_numeric($page_num)? abs((int)$page_num) : 1
        );
        
        //~ echo('<pre>');
        //~ print_r($request);
        //~ echo('</pre>');
        //~ die();
        
        return $this->render('AppBundle:default:index.html.twig', $data);
    }
    
    /**
     * @Route("/page_history/", name="page-history")
     */
    public function pageHistoryAction(Request $request)
    {
        // we'll assume if they're on page X they've completed all pages up to X
        $current_page = 1;
        $direction = 'forward';
        if(is_numeric($request->query->get('current_page'))) {
            $current_page = (int)$request->query->get('current_page');
        }
        if(in_array($request->query->get('direction'),array('forward','back'))) {
            $direction = $request->query->get('direction');
        }
        
        // build the history
        $history = range(1,$current_page);
        $current_page += $direction=='back'? -1 : 1;
        $current_page = max(1, $current_page);
        
        // prepare response
        $data = array(
            'page_history' => $history,
            'current_page' => $current_page
        );
        
        $response = new Response();
        $response->setContent(json_encode($data));
        $response->headers->set('Content-Type', 'application/json');
        return $response;
    }
}
