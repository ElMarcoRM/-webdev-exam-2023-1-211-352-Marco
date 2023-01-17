let api_key = "159c16ba-5792-4509-b4bb-434c511cd601";

let routes = [];
let routes_with_filter = [];
let guides = [];

let page = 1;

let guide_id = 0;
let route_id = 0;

let date = new Date();
let time = "12:00";
let duration = 1;
let people = 1;
let option = false;
let option2 = false;
let price = 0;
let cost = 0;

let objects = [];

//Функция получения списка маршрутов, выводим таблицу и запоминаем список (массив routes)
function get_routes(){
  let url = "http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/routes";
  fetch(url + "?api_key=" + api_key)
  .then(response => response.json())
  .then(data => {      
      if(data.error === undefined){
        let tbody = document.getElementById('routes_tbody');        
        routes = data;
        data.forEach(function(item, i, data) {
          let tr = document.createElement('tr');
          tr.setAttribute('id', 'route_tr_' + i);
          tr.clasName = "route_tr";
          let td_name = document.createElement('td');
          td_name.innerHTML = item.name;
          let td_description = document.createElement('td');
          if(item.description.length > 150){
            td_description.innerHTML = item.description.substring(0, 147) + "...";
            td_description.dataset.bsToggle = "tooltip";
            td_description.dataset.bsTitle = item.description;
            new bootstrap.Tooltip(td_description);
          }
          else{
            td_description.innerHTML = item.description;
          }
          
          let td_object = document.createElement('td');
          if(item.mainObject.length > 150){
            td_object.innerHTML = item.mainObject.substring(0, 147) + "...";
            td_object.dataset.bsToggle = "tooltip";
            td_object.dataset.bsTitle = item.mainObject;

            item.mainObject.split(' - ').forEach(function(item, i) {
              item = item.substring(0, 100);              
              if(objects.indexOf(item) == -1){
                objects.push(item);
              }              
            });

            new bootstrap.Tooltip(td_object);
          }
          else{
            td_object.innerHTML = item.mainObject;
          }
          let td_button = document.createElement('td');
          td_button.dataset.id = i;
          td_button.dataset.server_id = item.id;
          td_button.dataset.name = item.name;
          td_button.innerHTML = '<button class="btn btn-outline-primary btn-sm">Выбрать</button>';

          td_button.addEventListener('click', click_route_button, false);

          tr.append(td_name);
          tr.append(td_description);
          tr.append(td_object);
          tr.append(td_button);
          tbody.append(tr);
          
          //console.log(item);
        });
        
        let object_select = document.getElementById('object_select');
        object_select.addEventListener('change', change_object, false);
        object_select.innerHTML = "";
        let option_first_o = document.createElement('option');
        option_first_o.innerHTML = "Основной объект";
        option_first_o.value = "";
        object_select.append(option_first_o);
        
        for (let i = 0; i < objects.length; i++) {
          let option = document.createElement('option');
          option.innerHTML = objects[i];
          option.value = objects[i];
          object_select.append(option);
        }          
        pagination(routes);
      }
      else{
        console.log(data.error);
      }
  })
  .catch(error => {
      console.error(error);
  });
}

//функция пагинации для списка маршрутов
function pagination(routes_for_pagination){
  let item_start = page * 10 - 9;
  let item_finish = page * 10;
  routes_for_pagination.forEach(function(item, i, routes_for_pagination) {
    let tr = document.getElementById('route_tr_' + i);
    if(item_start <= (i+1) && (i+1) <= item_finish){
      tr.style.display = '';
    }
    else{
      tr.style.display = 'none';
    }
  });
  let number_pages = Math.floor(routes_for_pagination.length/10) + 1;
  
  let pagination_block = document.getElementById('routes_pagination');
  pagination_block.innerHTML = "";
  let routes_nav_li_prev = document.createElement('li');
  routes_nav_li_prev.dataset.id = (page == 1) ? 1 : page - 1;
  routes_nav_li_prev.className = "page-item pi_routes";
  routes_nav_li_prev.innerHTML = '<a class="page-link" href="#">Предыдущая</a>';
  pagination_block.append(routes_nav_li_prev);

  for(j = 1; j <= number_pages; j++){
    let routes_nav_li = document.createElement('li');
    routes_nav_li.dataset.id = j;
    routes_nav_li.className = (page == j) ? "page-item pi_routes active" : "page-item pi_routes";
    routes_nav_li.innerHTML = '<a class="page-link" href="#">' + j + '</a>';
    pagination_block.append(routes_nav_li);
  }
  let routes_nav_li_last = document.createElement('li');
  routes_nav_li_last.dataset.id = (page == number_pages) ? number_pages : page + 1;
  routes_nav_li_last.className = "page-item pi_routes";
  routes_nav_li_last.innerHTML = '<a class="page-link" href="#">Следующая</a>';
  pagination_block.append(routes_nav_li_last);

  let routes_nav_li_for_click = document.getElementsByClassName("pi_routes");
  for (let i = 0; i < routes_nav_li_for_click.length; i++) {
    routes_nav_li_for_click[i].addEventListener('click', click_routes_pagination, false);
  }
}

//функция смены страницы для списка маршрутов
function click_routes_pagination(e){
  e.preventDefault();
  let data_page = this.getAttribute("data-id");
  page = Number(data_page);
  if(routes_with_filter.length > 0){
    pagination(routes_with_filter);
  }
  else{
    pagination(routes);
  }  
}

//функция для кнопки выбора маршрута
function click_route_button(e){
  e.preventDefault();
  let route_trs = document.getElementsByClassName("route_tr");
  for (let i = 0; i < route_trs.length; i++) {
    route_trs[i].className = "route_tr";
  }
  let id_route = this.getAttribute("data-id");
  let tr_route = document.getElementById('route_tr_' + id_route);

  let route_name = document.getElementById('route_name');
  let modal_route_name = document.getElementById('modal_route_name');

  route_name.innerHTML = this.getAttribute("data-name");
  modal_route_name.innerHTML = this.getAttribute("data-name");
  tr_route.className = "route_tr table-warning";

  let server_id = this.getAttribute("data-server_id");
  
  route_id = server_id;
  get_guides(server_id)
}

//Функция получения списка гидов, выводим таблицу и запоминаем список (массив guides)
function get_guides(route_id){
  let url = "http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/routes/" + route_id + "/guides";
  fetch(url + "?api_key=" + api_key)
  .then(response => response.json())
  .then(data => {      
      if(data.error === undefined){
        let guides_list = document.getElementById('guides_list');
        guides_list.className = "col-md-12";        
        //guides_list.style.display = '';
        let tbody = document.getElementById('guides_tbody');
        tbody.innerHTML = "";
        guides = data;
        let langs = [];
        let guide_ot = 0;
        let guide_do = 100;
        data.forEach(function(item, i, data) {

          let tr = document.createElement('tr');
          tr.setAttribute('id', 'guide_tr_' + item.id);
          tr.clasName = "guide_tr";          

          let td_avatar = document.createElement('td');
          td_avatar.innerHTML = '<img class="img-fluid" src="avatar.jpg">';
          let td_fio = document.createElement('td');
          td_fio.innerHTML = item.name;
          let td_lang = document.createElement('td');
          td_lang.innerHTML = item.language;          
          if(langs.indexOf(item.language) == -1){
            langs.push(item.language);
          }
          let td_exp = document.createElement('td');
          td_exp.innerHTML = item.workExperience;
          let td_price = document.createElement('td');
          td_price.innerHTML = item.pricePerHour;
          
          let td_button = document.createElement('td');
          td_button.dataset.id = item.id;
          td_button.dataset.name = item.name;
          td_button.dataset.price = item.pricePerHour;
          td_button.dataset.server_id = item.id;
          td_button.innerHTML = '<button class="btn btn-outline-primary btn-sm" data-bs-toggle="modal" data-bs-target="#modal">Оформить заявку</button>';

          td_button.addEventListener('click', click_guide_button, false);

          tr.append(td_avatar);
          tr.append(td_fio);
          tr.append(td_lang);
          tr.append(td_exp);
          tr.append(td_price);
          tr.append(td_button);
          tbody.append(tr);
          //console.log(item);
        });

        let lang_select = document.getElementById('lang_select');
        lang_select.addEventListener('change', change_lang, false);
        lang_select.innerHTML = "";
        let option_first = document.createElement('option');
        option_first.innerHTML = "Язык экскурсии";
        option_first.value = "";
        lang_select.append(option_first);
        
        for (let i = 0; i < langs.length; i++) {
          let option = document.createElement('option');
          option.innerHTML = langs[i];
          option.value = langs[i];
          lang_select.append(option);
        }        
        
      }
      else{
        console.log(data.error);
      }
  })
  .catch(error => {
      console.error(error);
  });
}

//функция для кнопки выбора гида
function click_guide_button(e){
  e.preventDefault();
  
  let guide_trs = document.getElementsByClassName("guide_tr");
  for (let i = 0; i < guide_trs.length; i++) {
    guide_trs[i].className = "guide_tr";
  }
  let id_guide = this.getAttribute("data-id");
  let modal_guide_name = document.getElementById('modal_guide_name');
  modal_guide_name.innerHTML = this.getAttribute("data-name");
  
  price = this.getAttribute("data-price");

  let tr_guide = document.getElementById('guide_tr_' + id_guide);  

  tr_guide.className = "guide_tr table-warning";

  let server_id = this.getAttribute("data-server_id");

  guide_id = server_id;
  get_price();
}
//Расчет стоимости
function get_price(){  
  let modal_price = document.getElementById("modal_price");
  
  cost =  Number(price) * Number(duration) * Number(people);
  if(option === true){
    cost = cost * 1.3;
  }
  if(option2 === true){
    cost = cost * 1.5;
  }
  cost = Math.floor(cost);
  modal_price.innerHTML = cost;//.toLocaleString;
}
//изменение даты
let modal_date = document.getElementById("modal_date");
modal_date.addEventListener('change', function(e){
  date = this.value;
});
//изменение времени
let modal_time = document.getElementById("modal_time");
modal_time.addEventListener('change', function(e){
  time = this.value;
});
//изменение продолжительности
let modal_duration = document.getElementById("modal_duration");
modal_duration.addEventListener('change', function(e){
  duration = this.value;
  get_price();
});
//изменение количества человек
let modal_people = document.getElementById("modal_people");
modal_people.addEventListener('change', function(e){
  people = this.value;
  get_price();
});
//изменение дополнительной опции
let modal_option = document.getElementById("modal_option");
modal_option.addEventListener('change', function(e){  
  option = this.checked;
  get_price();
});
//изменение второй дополнительной опции
let modal_option2 = document.getElementById("modal_option2");
modal_option2.addEventListener('change', function(e){  
  option2 = this.checked;
  get_price();
});
//отправка заявки
let modal_sub = document.getElementById("modal_sub");
modal_sub.addEventListener('click', function(e){
  let url = "http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/orders";

  let formData = new FormData();
  formData.append('guide_id', guide_id);
  formData.append('route_id', route_id);
  formData.append('date', date);
  formData.append('time', time);
  formData.append('duration', duration);
  formData.append('id', guide_id + route_id);
  formData.append('optionFirst', option);
  formData.append('optionSecond', option2);
  formData.append('persons', people);
  formData.append('price', cost);
  formData.append('student_id', 12345654321);

  fetch(url + "?api_key=" + api_key, {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {      
      if(data.error === undefined){
         console.log(data);
      }
      else{
        console.log(data.error);
      }
  })
  .catch(error => {
      console.error(error);
  });

  let alert = document.getElementById("alert");
  alert.className = "row alert alert-warning";
  //alert.style.display = '';
  //alert.style.display = 'none';
  let message = document.getElementById("message");
  message.innerHTML = "Заявка успешно отправлена";  
  //window.scrollTo(0, 0);
}); 

//функция фильтрации гидов по языку
function change_lang(){
  let lang = this.value;
  for (let i = 0; i < guides.length; i++) {
    let lang_tr = document.getElementById('guide_tr_' + guides[i].id);
    if(lang == guides[i].language || lang == ""){
      lang_tr.style.display = '';
    }
    else{
      lang_tr.style.display = 'none';
    }
  }
}

//функция фильтрации маршрутов по объекту
function change_object(){  
  let obj = this.value;  
  routes_with_filter = [];
  if(obj != ""){
    page = 1;
    for (let i = 0; i < routes.length; i++) {
      if((routes[i].mainObject.indexOf(obj) > 0)){        
        routes_with_filter[i] = routes[i];
      }
    }
    get_routes_with_filters(routes_with_filter);
    pagination(routes_with_filter);
  }
  else{    
    pagination(routes);
  }
}

//функция вывода отфильтрованных маршрутов
function get_routes_with_filters(routes_with_filter){
  let tbody = document.getElementById('routes_tbody');
  tbody.innerHTML = "";
  routes_with_filter.forEach(function(item, i, routes_with_filter) {
    let tr = document.createElement('tr');
    tr.setAttribute('id', 'route_tr_' + i);
    tr.clasName = "route_tr";
    let td_name = document.createElement('td');
    td_name.innerHTML = item.name;
    let td_description = document.createElement('td');
    if(item.description.length > 150){
      td_description.innerHTML = item.description.substring(0, 147) + "...";
      td_description.dataset.bsToggle = "tooltip";
      td_description.dataset.bsTitle = item.description;
      new bootstrap.Tooltip(td_description);
    }
    else{
      td_description.innerHTML = item.description;
    }
    
    let td_object = document.createElement('td');
    if(item.mainObject.length > 150){
      td_object.innerHTML = item.mainObject.substring(0, 147) + "...";
      td_object.dataset.bsToggle = "tooltip";
      td_object.dataset.bsTitle = item.mainObject;

      item.mainObject.split(' - ').forEach(function(item, i) {
        item = item.substring(0, 100);              
        if(objects.indexOf(item) == -1){
          objects.push(item);
        }              
      });

      new bootstrap.Tooltip(td_object);
    }
    else{
      td_object.innerHTML = item.mainObject;
    }
    let td_button = document.createElement('td');
    td_button.dataset.id = i;
    td_button.dataset.server_id = item.id;
    td_button.dataset.name = item.name;
    td_button.innerHTML = '<button class="btn btn-outline-primary btn-sm">Выбрать</button>';

    td_button.addEventListener('click', click_route_button, false);

    tr.append(td_name);
    tr.append(td_description);
    tr.append(td_object);
    tr.append(td_button);
    tbody.append(tr);
    
    //console.log(item);
  });
}

//функция поиска маршрутов
let input_routes_search = document.getElementById("routes_search");
input_routes_search.addEventListener('input', function(e){
  search = this.value;
  routes_with_filter = [];

  if(search != ""){

    page = 1;
    for (let i = 0; i < routes.length; i++) {

      if((routes[i].mainObject.indexOf(search) != -1) || (routes[i].name.indexOf(search) != -1)|| (routes[i].description.indexOf(search)  != -1)){        
        routes_with_filter[i] = routes[i];
      }
    }

    get_routes_with_filters(routes_with_filter);
    pagination(routes_with_filter);

  }
  else{    
    pagination(routes);
  }


});

//функция фильтрации гидов по опыту работы
let guide_ot_input = document.getElementById("guide_ot");
guide_ot_input.addEventListener('change', function(e){
  guide_ot = this.value;
  get_price();
});
get_routes();