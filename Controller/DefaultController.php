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
        
        return $this->render('AppBundle:default:index.html.twig', $data);
    }
    
    /**
     * @Route("/page_history/", name="page-history")
     */
    public function pageHistoryAction(Request $request)
    {
        
        // we'll assume if they're on page X they've completed all pages up to X
        $current_page = 1;
        $direction = null;
        if(is_numeric($request->query->get('current_page'))) {
            $current_page = (int)$request->query->get('current_page');
        }
        if(in_array($request->query->get('direction'),array('forward','back'))) {
            $direction = $request->query->get('direction');
        }
        
        // do we still not know which direction they went? we'll have to figure something out...
        if(!$direction) {
            $nav_history_json = $request->query->get('navigation_history');
            $nav_history = json_decode($nav_history_json);
            
            // ie; the popstate url, NOT the page they're currently on
            $request_url = $request->query->get('request_url');
            $matches = array();
            $request_page = preg_match('#/page/([0-9]+)#', $request_url, $matches);
            if($request_page && isset($matches[1])) {
                $request_page = $matches[1];
            }
            
            // so the procedure I think this:
            //  if no direction is supplied, take the last two steps from the nav history,
            //  in reverse order to get the direction.
            //  ... return the page for that, or stay where they are and wait for a backstep confirmation
            if (count($nav_history)<2) {
                // @todo! ... is there even any browser nav possible with 0/1 history states?
            } else {
                $nh = $nav_history;
                $last = array_pop($nh);
                if($request_page>$last) {
                    $direction = 'forward';
                }
                if($request_page<$last) {
                    $direction = 'back';
                }
                //~ print_r("{$last}|{$next_last}|{$direction}");
                //~ die();
            }
        }
        
        // build the history
        $history = range(1,$current_page);
        if($direction=='back') {
            $current_page--;
        }
        if($direction=='forward') {
            $current_page++;
        }
        $current_page = max(1, $current_page);
        
        // prepare response. we'll have to tell them the direction in case they don't know
        $data = array(
            'page_history' => $history,
            'current_page' => $current_page,
            'direction'    => $direction
        );
        
        $response = new Response();
        $response->setContent(json_encode($data));
        $response->headers->set('Content-Type', 'application/json');
        
        return $response;
    }
}
