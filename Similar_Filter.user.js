// ==UserScript==
// @name        Similar Filter
// @namespace        http://tampermonkey.net/
// @version        0.2
// @description        不要な「あなたと似た記事を書いているブログ」の非表示
// @author        Ameba Blog User
// @match        https://blog.ameba.jp/ucs/entry/srventryinsertend.do
// @match        https://blog.ameba.jp/ucs/entry/srventryinsertdraft.do
// @match        https://blog.ameba.jp/ucs/entry/srventryupdateend.do
// @match        https://blog.ameba.jp/ucs/entry/srventryupdatedraft.do
// @icon        https://www.google.com/s2/favicons?sz=64&domain=ameblo.jp
// @grant        none
// @updateURL        https://github.com/personwritep/Similar_Filter/raw/main/Similar_Filter.user.js
// @downloadURL        https://github.com/personwritep/Similar_Filter/raw/main/Similar_Filter.user.js
// ==/UserScript==



let block_id=[];
let read_json=localStorage.getItem('SimilarBlock_ID'); // ローカルストレージ保存名
block_id=JSON.parse(read_json);
if(block_id==null){ block_id=['tmp1','%Ameba-ID']; }
let block_filter=block_id.join('|');
let block_regex=RegExp(block_filter);

let edit_mode; // Similar Filter の動作モード
edit_mode=localStorage.getItem('SimilarBlock_mode'); // ローカルストレージ保存名
if(edit_mode!=0 && edit_mode!=1){
    edit_mode=0;
    localStorage.setItem('SimilarBlock_mode', 0); } // edit_mode 初期値「0」


let help_url='https://ameblo.jp/personwritep/entry-12823680965.html';


let retry=0;
let interval=setInterval(wait_target, 100);
function wait_target(){
    retry++;
    if(retry>10){ // リトライ制限 10回 1sec
        clearInterval(interval); }
    let sf_Header=document.querySelector('h2.entryComplete__entriesTitle'); // 監視
    if(sf_Header){
        clearInterval(interval);
        setter(sf_Header); }}


function setter(sf_sw){
    let style=
        '<style class="sf_style">'+
        '.help_sf { position: absolute; right: 6px; top: 13px; } '+
        '.help_sf_svg { height: 24px; width: 24px; cursor: pointer; } '+
        '.entryComplete__entries { position: relative; } '+
        'h2.entryComplete__entriesTitle { position: relative; padding: 11px 16px 6px; '+
        'margin: 20px 5px 5px; cursor: pointer; } '+
        '.entryComplete__entriesItem { position: relative; } '+
        '.RB_sw { position: absolute; top: 2px; left: 2px; font: bold 14px Meiryo; '+
        'padding: 6px 2px 4px; border: 1px solid #aaa; background: #fff; '+
        'cursor: pointer; display: none; }'+
        '.RB_sw.B:hover { color: red; }'+
        '.RB_sw.U:hover { color: #26c6da; }'+
        '.RB_item:hover .RB_sw { display: block; }'+
        '</style>';

    if(!document.querySelector('.sf_style')){
        document.body.insertAdjacentHTML('beforeend', style); }



    let help_SVG=
        '<svg class="help_sf_svg" viewBox="0 0 210 220">'+
        '<path d="M89 22C71 25 54 33 41 46C7 81 11 142 50 171C58 177 '+
        '68 182 78 185C90 188 103 189 115 187C126 185 137 181 146 175'+
        'C155 169 163 162 169 153C190 123 189 80 166 52C147 30 118 18'+
        ' 89 22z" style="fill:#000;"></path>'+
        '<path d="M67 77C73 75 78 72 84 70C94 66 114 67 109 83C106 91'+
        ' 98 95 93 101C86 109 83 116 83 126L111 126C112 114 122 108 1'+
        '29 100C137 90 141 76 135 64C127 45 101 45 84 48C80 49 71 50 '+
        '68 54C67 56 67 59 67 61L67 77M85 143L85 166L110 166L110 143L'+
        '85 143z" style="fill:#fff;"></path>'+
        '</svg>';

    let help_sf=
        '<a class="help_sf" href="'+ help_url +'" target="_blank" rel="noopener">'+
        help_SVG +'</a>';

    if(!document.querySelector('.help_sf')){
        sf_sw.insertAdjacentHTML('beforeend', help_sf); }

    let help_sw=document.querySelector('.help_sf');
    if(help_sw){
        help_sw.onclick=function(event){
            event.stopImmediatePropagation(); }}



    if(edit_mode==0){
        sf_sw.style.background='#fff'; }
    else{
        sf_sw.style.background='red'; }

    blocker();

    sf_sw.addEventListener('click', function(event){
        event.preventDefault();
        if (event.ctrlKey==true){
            menu(); }
        else{
            emode_set(); }}, false);

} // setter()




function menu(){
    let ua=0;
    let agent=window.navigator.userAgent.toLowerCase();
    if(agent.indexOf('firefox') > -1){ ua=1; }

    let inner=
        '<div id="file_menu">'+
        '<input id="button0" type="submit" value="✖ 閉じる">'+
        '<input id="button1" type="submit" value="ブロックデータを保存">'+
        '<input id="button_add" type="checkbox">'+
        '<span id="button_add_label">差分追加</span>'+
        '<input id="button2" type="file">'+
        '<style>'+
        '#file_menu { position: absolute; top: 0; left: 0; width: calc(100% - 60px); '+
        'padding: 1px 25px 0; margin: 0 5px; background: #7ca5c3; z-index: 1; } '+
        '#file_menu input { font: normal 14px/24px Meiryo; } '+
        '#button_add { margin: 0 5px 0 60px; width: 15px; height: 15px; '+
        'vertical-align: -2px; } '+
        '#button_add_label { font-size: 15px; vertical-align: -1px; }';

    if(ua==0){
        inner+=
            '#button0 { padding: 2px 6px 0; margin: 9px 0; }'+
            '#button1 { padding: 2px 8px 0; margin: 9px 0 9px 60px; }'+
            '#button2 { margin: 9px 20px 9px 10px; width: 280px; }'; }

    if(ua==1){
        inner+=
            '#button0 { padding: 0 6px; margin: 9px 0; height: 27px; }'+
            '#button1 { padding: 0 8px; margin: 9px 0 9px 60px; height: 27px; }'+
            '#button2 { margin: 9px 20px 9px 10px; width: 280px; }'; }

    inner+='</style></div>';

    let entries=document.querySelector('.entryComplete__entries');
    if(entries && !document.querySelector('#file_menu')){
        entries.insertAdjacentHTML('afterbegin', inner); }


    let file_menu=document.querySelector('#file_menu');
    if(file_menu){
        let button0=document.querySelector('#button0');
        if(button0){
            button0.onclick=function(){
                file_menu.remove(); }}


        let button1=document.querySelector('#button1');
        if(button1){
            button1.onclick=function(){
                let write_json=JSON.stringify(block_id);
                let blob=new Blob([write_json], {type: 'application/json'});
                let a=document.createElement("a");
                a.href=URL.createObjectURL(blob);
                document.body.appendChild(a);
                a.download='ranking_bl.json'; // 保存ファイル名は「ranking_bl.json」
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(a.href); }}


        let button_add=document.querySelector('#button_add');
        button_add.checked=true;


        let button2=document.querySelector('#button2');
        if(button2){
            button2.addEventListener("change" , function(){
                if(!(button2.value)) return; // ファイルが選択されない場合
                let file_list=button2.files;
                if(!file_list) return; // ファイルリストが選択されない場合
                let file=file_list[0];
                if(!file) return; // ファイルが無い場合

                let file_reader=new FileReader();
                file_reader.readAsText(file);
                file_reader.onload=function(){
                    if(file_reader.result.slice(0, 7)=='["tmp1"'){ //「ranking_bl.json」の確認
                        let data_in=JSON.parse(file_reader.result);

                        if(button_add.checked==true){ // 差分追加処理
                            for(let k=0; k<data_in.length; k++){
                                if(block_regex.test(data_in[k])==false){ // ID未出なら追加
                                    block_id.push(data_in[k]); }}}
                        else{
                            block_id=data_in; } // 読込み上書き処理

                        let write_json=JSON.stringify(block_id);
                        localStorage.setItem('SimilarBlock_ID', write_json); // ストレージ保存名
                        location.reload(); }}; }); }}

} // menu()




function emode_set(){
    let sf_sw=document.querySelector('h2.entryComplete__entriesTitle');
    if(edit_mode==0){
        edit_mode=1;
        localStorage.setItem('SimilarBlock_mode', 1);
        sf_sw.style.background='red';
        blocker(); }
    else if(edit_mode==1){
        edit_mode=0;
        localStorage.setItem('SimilarBlock_mode', 0);
        sf_sw.style.background='#fff';
        blocker(); }}




function blocker(){
    let user_href=[];
    let user_a=[];

    let entriesItem=document.querySelectorAll('.entryComplete__entriesItem');
    for(let k=0; k<entriesItem.length; k++){
        user_a[k]=entriesItem[k].querySelector('.entryComplete__entriesBloggerLink');
        user_href[k]=user_a[k].getAttribute('href');
        block_item(entriesItem[k], user_href[k]);
        check_item(entriesItem[k], user_href[k]); }


    function block_item(item, user_href){
        if(block_regex.test(user_href)==true){
            if(edit_mode==0){
                item.style.visibility='hidden'; }
            if(edit_mode==1){
                item.style.visibility='visible';
                item.style.background='#a9c1cf'; }}
        else{
            item.style.visibility='visible';
            item.style.background='#f2f8fc'; }}


    function check_item(item, user_href){
        item.classList.add('RB_item');
        let sw;
        if(block_regex.test(user_href)==false){
            sw='<div class="RB_sw B">Block</div>'; }
        else{
            sw='<div class="RB_sw U">Unset</div>'; }
        if(item.querySelector('.RB_sw')){
            item.querySelector('.RB_sw').remove(); }
        item.insertAdjacentHTML('beforeend', sw);

        let RB_sw=item.querySelector('.RB_sw');
        RB_sw.onclick=function(event){
            event.preventDefault();
            local_backup(user_href); }}


    function local_backup(user_href){
        if(block_regex.test(user_href)!=true){
            let ok=confirm(" ⛔　 ブロックリストに登録しますか？");
            if(ok){
                let user_id=user_href.replace('https://ameblo.jp/', '');
                block_id.push(user_id);
                let write_json=JSON.stringify(block_id);
                localStorage.setItem('SimilarBlock_ID', write_json); }} // ストレージ保存名
        else{
            let ok=confirm(" 🟢　 ブロックリストから外し表示させますか？");
            if(ok){
                let user_id=user_href.replace('https://ameblo.jp/', '');
                block_id=block_id.filter( function(item){
                    return item !==user_id; });
                let write_json=JSON.stringify(block_id);
                localStorage.setItem('SimilarBlock_ID', write_json); }} // ストレージ保存名

        block_filter=block_id.join('|');
        block_regex=RegExp(block_filter);
        blocker(); }

} // blocker
