// window.addEventListener('scroll', positionSelectedMenu);

function positionSelectedMenu(elem){
    //console.log(localStorage.zoom)
    if(!selectedItem) return
//     const viewport = selectedItem.getBoundingClientRect();
//     const main = document.getElementById("main").getBoundingClientRect();
//    // console.log(main)
//     const zoom = localStorage.zoom || 1;
//     const coord = viewport;
//     const centerPoint = main.width / 4 * 2.25;

//     let left,
//     position,
//     top;

//     if(coord.left <= centerPoint){
//         left = coord.left
//     }else{
//         const menuW = document.getElementById('selected-menu-segment').offsetWidth || 511;
//         left = (coord.left + selectedItem.offsetWidth) - menuW
//     }
//     position = "fixed";
//     if( viewport.top < 50 || viewport.top > window.screen.height && viewport.height > 200){
//         top = 50;
//     }else{
//         //position = "fixed";
//         top = (coord.top * zoom ) - 48;
//     }

    // $("#selected-menu-segment").css({
    //     top: top,
    //     display: "inline-block",
    //     left: left * zoom,
    //     position: position
    // });
    $("#selected-menu-segment").css({
        // top: "60px",
        display: "inline-flex",
        // left: "60px",
        // position: "fixed"
    });
}

function moveElement(direction) {
    if (selectedItem.dataset.component && selectedItem.dataset.component === "dv-input") {
        selectedItem = selectedItem.closest(".field");
    }
    if (direction === "up") {
        if ($(selectedItem).prev().length === 0) {
            viewMainMessage("error", "Este elemento no puede subir más");
        } else {
            $(selectedItem).insertBefore($(selectedItem).prev());
            highlightElement(selectedItem);
        }
    } else if (direction === "down") {
        if ($(selectedItem).next().length === 0) {
            viewMainMessage("error", "Este elemento no puede bajar más");
        } else {
            $(selectedItem).insertAfter($(selectedItem).next());
            highlightElement(selectedItem);
        }
    }
}

function upToParent() {
    var el = selectedItem.parentElement.closest("[data-editor]");
    if (el) {
        selectedItem = el;
        showEditionMenu();
    } else {
        viewMainMessage("error", "No puedes subir más");
    }
}
/**
 *
 *
 * Funciones que manejan el estilo CSS
 *
 */

function removeClass(el, className) {
    if (!el || !className) return;
    el.className = el.className
        .replace(
            new RegExp("(^|\\b)" + className.split(" ").join("|") + "(\\b|$)", "gi"),
            ""
        )
        .trim();
}

function addClass(el, className) {
    if (!el || !className) return;
    el.className = el.className.trim() + " " + className;
}

function hasClass(el, className) {
    if (!el || !className) return false;
    return new RegExp("(^| )" + className + "( |$)", "gi").test(el.className);
}

function getOffset(el) {
    return {
        top: el.offsetTop,
        left: el.offsetLeft
    };
}

function alignElement(align) {
    selectedItem.style.textAlign = align;
    activeSavePageButton();
}

/**Deselecciona un elemento */
function unselectItem() {
    // if (selectedItem && selectedItem.className) {
    //     selectedItem.className.replace(/selected/i, "");
    //     selectedItem.className.trim();
    // }

    if (selectedItem && selectedItem.classList.contains("selected"))
        selectedItem.classList.remove("selected")

    document.getElementById("selected-menu").style.display = "none";
    document.getElementById("selected-menu-segment").style.display = "none";
    // let info = document.getElementById("elementInfo");
    // if(info)
    //     info.innerHTML = ""
    selectedItem = null;
}

function dropdownMenu() {
    if (hasClass(selectedItem, "dropdown")) {
        if (
            $(selectedItem)
            .children(".menu")
            .is(":hidden")
        ) {
            $(selectedItem)
                .children(".menu")
                .show();
        } else {
            $(selectedItem)
                .children(".menu")
                .hide();
        }
    }
}

function fadeIn(el) {
    el.style.opacity = 0;
    el.style.display = "block";

    var last = +new Date();
    var tick = function() {
        el.style.opacity = +el.style.opacity + (new Date() - last) / 400;
        last = +new Date();

        if (+el.style.opacity < 1) {
            (window.requestAnimationFrame && requestAnimationFrame(tick)) ||
            setTimeout(tick, 16);
        }
    };

    tick();
}

function collapse(el, display) {
    if (!display)
        display = "block";
    if (el.style.display === "none")
        el.style.display = display;
    else el.style.display = "none";
}

/**
 *
 *
 * Funciones de manejo de modales
 *
 */

/**1.Edición de tamaño de los contenedores
 * Limpia el class y lo muestra en el input
 * Abre el modal
 */
function openSizeContainerModal() {
    if (selectedItem.dataset.editor != "segment") return;
    var savedClassName = selectedItem
        .getAttribute("class")
        .replace(/selected/i, "");
    document.getElementById("containerClass").value = savedClassName.trim();
    $("#editContainerModal").modal("show");
}
/**2.
 * Asigna los cambios y reinicia valores
 * Cierra el modal
 */
function saveDataSizeContainer() {
    var clase = document.getElementById("containerClass").value;
    selectedItem.setAttribute("class", clase + " selected");
    var radios = document.querySelectorAll(".containerSize");
    for (var i = 0; i < radios.length; i++) {
        if (radios[i].checked) radios[i].checked = false;
    }
    $("#editContainerModal").modal("hide");
}

/**1.Edición de tamaño de las columnas
 * Limpia el class y lo muestra en el input
 * Abre el modal
 */
function openSizeColumnModal() {
    if (!hasClass(selectedItem, "column")) return;
    var clase = selectedItem.getAttribute("class");
    clase = clase.replace(/selected/i, "");
    document.getElementById("editSizeClass").value = clase.trim();
    $("#editSizeModal").modal("show");
}
/**2.
 * Asigna los cambios
 * Cierra el modal
 */
function saveDataSizeColumn() {
    var clase = document.getElementById("editSizeClass").value;
    selectedItem.setAttribute("class", clase + " selected");
    $("#editSizeModal").modal("hide");
}

/**1.Edición del elemento seleccionado
 * Devuelve el modal. EL formulario se genera en 2.
 */
function editElementModal() {
    return `
    <i class="close icon"></i>
    <div class="ui header">Edita el texto del elemento</div>
    <div class="content">
        <div class="ui tiny header">Añadir elemento al texto</div>
        <div class="ui icon vertical buttons" onclick="$('#edit-element-bar-menu').toggle();$('#editableText').toggle();"><button class="ui icon button"><i class="right arrow icon"></i></button></div>
        <div class="ui icon vertical buttons" style="display: none;" id="edit-element-bar-menu">
            <button class="ui button" title="<a> Añadir salto de línea" onclick="addTextElement('br');">
                <i class="icon">BR</i>
            </button>
            <button class="ui button" title="<a> Añadir enlace" onclick="addTextElement('a');">
                <i class="linkify icon"></i>
            </button>
            <button class="ui button" title="<b> Texto en negrita" onclick="addTextElement('b');">
                <i class="bold icon"></i>
            </button>
            <button class="ui button" title="<i> Texto en itálica" onclick="addTextElement('i');">
                <i class="italic icon"></i>
            </button>
            <button class="ui button" title="<pre> Texto preformateado" onclick="addTextElement('pre');">
                <i class="file code icon"></i>
            </button>
            <button class="ui button" title="<code> Texto de código" onclick="addTextElement('code');">
                <i class="code icon"></i>
            </button>
            <button class="ui button" title="<mark> Texto resaltado" onclick="addTextElement('mark');">
                <i class="bookmark icon"></i>
            </button>
            <button class="ui button" title="<small> Texto disminuido" onclick="addTextElement('small');">
                <i class="small font icon"></i>
            </button>
            <button class="ui button" title="<strong> Texto aumentado" onclick="addTextElement('strong');">
                <i class="large font icon"></i>
            </button>
            <button class="ui button" title="<sub> Texto subíndice" onclick="addTextElement('sub');">
                <i class="subscript icon"></i>
            </button>
            <button class="ui button" title="<sup> Texto superíndice" onclick="addTextElement('sup');">
                <i class="superscript icon"></i>
            </button>
            <button class="ui button" title="<time> Texto hora" onclick="addTextElement('time');">
                <i class="clock icon"></i>
            </button>
            <button class="ui button" title="<span> Contenedor en línea" onclick="addTextElement('span');">
                <i class="inbox icon"></i>
            </button>
            <button class="ui button" title="<div> Contenedor en bloque" onclick="addTextElement('div');">
                <i class="box icon"></i>
            </button>
        </div>
        <div class="ui divider"></div>
        <form class="ui form" id="editElementForm" autocomplete="off"></form>
    </div>
    <div class="ui right aligned basic segment">
        <button class="ui circular green icon button" onclick="saveEditElementForm();"><i class="check icon"></i></button>
        <button class="ui circular red icon button" onclick="$('#editElementModal').modal('hide');"><i class="close icon"></i></button>
    </div>`;
}
/**2.
 * Repinta el formulario a partir del texto y los atributos del elemento
 * Abre el modal
 */
function openEditElementModal() {
    //var gutters = ["CodeMirror-lint-markers", "CodeMirror-linenumbers", "CodeMirror-foldgutter"];
    document.getElementById("edit-element-bar-menu").style.display = "none";
    var form = document.forms.editElementForm,
        attrs = selectedItem.attributes,
        text = selectedItem.innerHTML;
    form.innerHTML = "";
    form.insertAdjacentHTML(
        "beforeend",
        `
        <div class="field">
        <textarea name="text" id="editableText" style="width: 100%; display: none;" rows="2" spellcheck="false">${text}</textarea>
        </div>
        <div class="ui small header">
            Atributos del elemento
            <a class="ui right floated button addAttribute" onclick="addAttribute();">Añadir atributo</a>
        </div>
        `
    );

    // TODO: Cambiar estructura textarea, reimplementar select.

    var cm = CodeMirror(document.getElementById("editableText"), {
            mode: "htmlmixed",
            theme: "monokai",
            lineNumbers: true,
            matchBrackets: true,
            autoCloseBrackets: true,
            foldGutter: true,
//            gutters,
            lint: true,
//            value: text
        });

    for (var i = 0; i <= attrs.length - 1; i++) {
        var name = attrs[i].name;

        if (name !== "data-editor" && name !== "data-component" && name !== "data-path" && name !== "contenteditable" && name !== "draggable") {
            //Los atributos data-component y data-editor no se editan
            var value;
            if (typeof attrs[i].value == "object")
                value = JSON.stringify(attrs[i].value);
            else
                value = attrs[i].value;
            var html = `
            <div class="field">
                <label>${name}</label>`;

            html += `<textarea name="${name}" rows="2" spellcheck="false">${value}</textarea>`;

            html += `</div>`;
            form.insertAdjacentHTML("beforeend", html);
        }
    }
    $("#editElementModal").modal("show");
    cm.refresh();
}
/**3.
 * Añade inputs al formulario para añadir atributos
 */
function addAttribute() {
    var form = document.forms.editElementForm;
    form.insertAdjacentHTML("beforeend", `
        <div class='two fields'>
            <div class='field'>
                <label>Nombre del atributo</label>
                <input class='attrName' type='text' name='attrName[]'/>
            </div>
            <div class='field'>
                <label>Valor del atributo</label>
                <input class='attrValue' type='text' name='attrValue[]'/>
            </div>
        </div>`);
}
/**4.
 * Asigna al elemento el texto y los atributos recogidos de los inputs
 * Repinta el elemento
 * Cierra el modal
 */
function saveEditElementForm() {
    var form = document.forms.editElementForm; //Selecciona el formulario
    var old_state = cloneObject(segment_toJson(selectedItem));

    //Recorremos los atributos antiguos y asignamos
    for (var i = 0; i <= form.length - 1; i++) {
        if (i === 0) { //Este es textarea del contenido
            selectedItem.innerHTML = form[i].value;
        } else { //El resto de atributos
            var pattern = new RegExp("attr.");
            if (!pattern.test(form[i].className)) {
                if (form[i].value !== "") { //Si no está vacio se establece el atributo
                    selectedItem.setAttribute(form[i].name, form[i].value);
                } //Si eta vacio se elimina
                else selectedItem.removeAttribute(form[i].name);
            }
        }
    }

    //Seleccionamos los nuevos atributos añadidos y se asignan
    var inputsName = document.getElementsByClassName("attrName");
    var inputsValue = document.getElementsByClassName("attrValue");

    if (inputsName.length > 0 && inputsValue.length > 0) {
        var max = inputsName.length - 1;
        for (var i = 0; i <= max; i++) {
            if (inputsName[i].value !== "" && inputsValue[i].value !== "")
                selectedItem.setAttribute(inputsName[i].value, inputsValue[i].value);
            //console.log(inputsName[i].value, inputsValue[i].value);
        }
    }
    //Forzamos el repintado
    var json = segment_toJson(selectedItem);
    try {
        replaceNodo(json);
    } catch (e) {
        replaceNodo(old_state);
    }


    $("#editElementModal").modal("hide");
}
/**5.
 * Recoge el texto del textarea de edición y devuelve un array con el texto seleccionado en la posicion [1]
 */
function getSelected() {
    var editor = document.getElementById("editableText");
    var u = editor.value;
    var start = editor.selectionStart;
    var end = editor.selectionEnd;
    return [u.substring(0, start), u.substring(start, end), u.substring(end)];
}
/**6.
 * Añade el elemento seleccionado tag al texto del textarea
 */
function addTextElement(tag) {
    var newText;
    var selection = getSelected();
    if (tag === "br")
        newText = selection[0] + selection[1] + `<${tag}>` + selection[2];
    else
        newText =
        selection[0] + `<${tag}>` + selection[1] + `</${tag}>` + selection[2];
    document.getElementById("editableText").value = newText;
}

/**1.Popup de selección de imágenes
 * Abre nueva ventana
 */
// function openImagePopup() {
//     window.addEventListener("message", function(event) {
//         //Add selected image into page;

//         if (
//             event.data.source === "dv-zity-asset-manager" &&
//             event.data.operation === "SELECTED_ASSETS"
//         ) {
//             var id = event.data.payload[0];
//             if (selectedItem) {

//                 selectedItem.setAttribute("data-file", id);

//                 doAjax(
//                     API +
//                     getRealm() +
//                     "/collections/files/" +
//                     id
//                 ).then(function(data) {

//                     if (data.uri) {
//                         if (selectedItem.hasAttribute("src"))
//                             selectedItem.setAttribute(
//                                 "src",
//                                 getLocalized(data.uri, getLocale())
//                             );
//                         else {
//                             if (selectedItem.hasAttribute("data-component")) {
//                                 selectedItem.replaceWith(
//                                     registeredComponents["dv-simple"].render({
//                                             src: getLocalized(data.uri, getLocale()),
//                                             alt: "Imagen",
//                                             file: id,
//                                             style: "max-width: 100%",
//                                             "data-component": "dv-simple",
//                                             tag: "img"
//                                         },
//                                         selectedItem.getAttribute("data-path")
//                                     )
//                                 );
//                             }
//                         }
//                     }
//                 });
//             }
//         }
//     });
//     const url = new URL( IMS ); // Abre el administrador de archivos
//     var key = generateId(12);
//     url.searchParams.set("type", "image");
//     url.searchParams.set("limit", 1);
//     url.searchParams.set("selected", JSON.stringify([]));
//     url.searchParams.set("instance", key);
//     url.searchParams.set("realm", getRealm());
//     const filesWindow = window.open(url.href, key, "width=500");
// }

function openImagePopup(limit = 1) {
    const rootDialog = document.getElementById("dialog");

    isOpenAssetsManager = !isOpenAssetsManager

    const selected = selectedItem;
    m.mount(rootDialog,{
        view: ()=>{
            return (
                isOpenAssetsManager
                ? m(AssetsManager, {
                    realm: localStorage.realm || "alcantir",
                    close: () => isOpenAssetsManager = false ,
                    accept: (ids, col, full) => {
                        //console.log(ids, col, full)

                        //No se cambia nada
                        if (ids.length && !full.length) {
                            return isOpenAssetsManager = false
                        }
                        //Ha habido cambios
                        else if (Array.isArray(ids) && ids.length){
                            selected.dataset.file = ids[0]
                            //selected.src = full[0].href
                            selected.src = localizeFileUri(ids[0],getRealm(), col)
                            if(col)
                                selected.dataset.collection = col
                        }
                        //Se ha deseleccionado la imagen
                        else {
                            selected.dataset.file = undefined
                            selected.src = "images/noimage.png";
                            if(selected.hasAttribute("data-collection"))
                                selected.removeAttribute("data-collection")
                        }
                        activeSavePageButton()
                        isOpenAssetsManager = false
                    },
                    limit: limit,
                    type: "image",
                    data: selected ? selected.dataset : "",
                    name: "file"
                })
                :null
            )
        }
    })
}

/**2. */
function dec2hex(dec) {
    return ("0" + dec.toString(16)).substr(-2);
}
/**3.
 * Devuelve un id
 */
function generateId(len) {
    var arr = new Uint8Array((len || 40) / 2);
    window.crypto.getRandomValues(arr);
    return Array.from(arr, dec2hex).join("");
}

/**1.
 * Devuelve el conjunto de modales de edición + los modales de los componentes
 */
// function modals() {
//     var modal = `
//         <div class="ui tiny modal" id="saveDataModal">
//             <i class="close icon"></i>
//             <div class="ui basic segment">
//                 <div class="ui header">Guarda Página</div>
//                 <div class="ui form">
//                     <div class="field">
//                         <label>Escribe el nombre de la página</label>
//                         <input type="text" name="templateName" id="templateName" required/>
//                     </div>
//                     <div class="field">
//                         <label>Escribe el título de la página</label>
//                         <input type="text" name="templateTitle" id="templateTitle" required/>
//                     </div>
//                     <div class="field">
//                         <label>Escribe el nombre de la web</label>
//                         <input type="text" name="templateWeb" id="templateWeb" required/>
//                     <div class="field" style="margin-top: 1rem;">
//                         <button class="ui button" onclick="saveNewPage();">Guardar</button>
//                     </div>
//                 </div>
//                 <div class="ui error message" id="saveDataError" style="display: none;">
//                     <div class="ui header">Hubo un error</div>
//                     <p>Nombre de archivo vacio o demasiado corto</p>
//                 </div>
//             </div>
//         </div>


//         <div class="ui tiny modal" id="editSizeModal">
//             <i class="close icon"></i>
//             <div class="ui segment">
//                 <div class="ui header">Edita el tamaño de la columna</div>
//                 <div class="content">
//                     <div class="ui form">
//                         <div class="field">
//                             <label>Escribe la clase de la columna, p.ej. "six wide column"</label>
//                             <input type="text" id="editSizeClass"/>
//                         </div>
//                         <div class="field">
//                             <button class="ui button" onclick="saveDataSizeColumn();">Guardar</button>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>


//         <div class="ui basic modal" id="saveEditedDataModal">
//             <i class="close icon"></i>
//             <div class="header">¿Seguro que desea sobreescribir los datos?</div>
//             <div class="content">
//                 <button class="ui button" onclick="saveEditedPage();">Guardar</button>
//             </div>
//         </div>


//         <div class="ui tiny modal" id="editContainerModal">
//             <i class="close icon"></i>
//             <div class="header">Edita el contenedor</div>
//             <div class="content">
//                 <div class="ui form">
//                     <div class="inline fields">
//                         <label>Ancho del contenedor</label>
//                         <div class="field">
//                             <div class="ui radio checkbox">
//                                 <input type="radio" class="containerSize" name="size" data-size="ui container">
//                                 <label>Contenedor Centrado</label>
//                             </div>
//                         </div>
//                         <div class="field">
//                             <div class="ui radio checkbox">
//                                 <input type="radio" class="containerSize" name="size" data-size="ui fluid container">
//                                 <label>Ancho completo</label>
//                             </div>
//                         </div>
//                         <div class="field">
//                             <div class="ui radio checkbox">
//                                 <input type="radio" class="containerSize" name="size" data-size="ui text container">
//                                 <label>Reducido</label>
//                             </div>
//                         </div>
//                     </div>
//                     <!--<div class="ui small header">Atributos del contenedor</div>-->
//                     <div class="field">
//                         <!--<label>Clase</label>-->
//                         <input type="text" id="containerClass" disabled />
//                     </div>
//                     <!--<div class="field">
//                         <label>Style</label>
//                         <input type="text" id="containerStyle" />
//                     </div>-->
//                     <div class="field">
//                         <button class="ui button" onclick="saveDataSizeContainer();">Guardar</button>
//                     </div>
//                 </div>
//             </div>
//         </div>


//         <div class="ui  modal" id="editPageModal">
//             <i class="close icon"></i>
//             <div class="header">Edita datos de la página</div>
//             <div class="content">
//                 <div class="ui form">
//                     <div class="field">
//                         <label>ID</label>
//                         <input type="text" name="editPageId" id="editPageId" readonly>
//                     </div>
//                     <div class="field">
//                         <label>Name</label>
//                         <input type="text" name="editPageName" id="editPageName" placeholder="Escribe el nombre de la página">
//                     </div>
//                     <div class="field">
//                         <label>Título</label>
//                         <input type="text" name="editPageTitle" id="editPageTitle" placeholder="Escribe el título de la página">
//                     </div>
//                     <div class="field">
//                         <label>Favicon de la página</label>
//                         <input type="text" name="editPageFavicon" id="editPageFavicon" placeholder="URL del favicon de la página">
//                     </div>
//                     <div class="field">
//                         <label>Dependencias</label>
//                         <textarea name="editPageDependencies" id="editPageDependencies" placeholder="Dependencias de la página"></textarea>
//                     </div>
//                     <div class="field">
//                         <input type="checkbox" tabindex="0" class="hidden" id="editPagePlantilla">
//                         <label>Señala si ésta es una página de Plantillas</label>
//                     </div>

//                     <div class="field">
//                         <label>Nombre de la web</label>
//                         <input type="text" name="editPageWeb" id="editPageWeb" placeholder="Escribe el nombre de la web">
//                     </div>
//                     <div class="field">
//                         <label>Sección de la web</label>
//                         <input type="text" name="editPageSection" id="editPageSection" placeholder="Escribe el nombre de la sección">
//                     </div>

//                     <div class="field">
//                         <label>Editores</label>
//                         <textarea name="editPageOwners" id="editPageOwners" placeholder="Lista de Ids de Editores separados por comas"></textarea>
//                     </div>

//                     <div class="field">
//                         <label>Contexto</label>
//                         <textarea name="editPageContext" id="editPageContext" placeholder="Lista de variables de la página"></textarea>
//                     </div>

//                     <div class="field">
//                         <button class="ui button" onclick="saveEditPageData();">Guardar</button>
//                     </div>
//                     <div class="ui error message" id="editPageError" style="display: none;">
//                         <div class="ui header">Hubo un error</div>
//                         <div class="content" id="editPageErrorMessage"></div>
//                     </div>
//                 </div>
//             </div>
//         </div>

//         <div class="ui basic modal" id="deletePageModal">
//             <i class="close icon"></i>
//             <div class="header">¿Seguro que desea eliminar esta página?</div>
//             <div class="content">
//                 <button class="ui red button" onclick="eliminarPagina(this.dataset.id);" data-id="" id="deletePageButton">Eliminar</button>
//             </div>
//         </div>

//         <div class="ui fullscreen modal" id="editJSModal">
//             <i class="close icon"></i>
//             <div class="header">Edita Javascript personalizado</div>
//             <div class="content">
//                 <div class="ui form">
//                     <div class="field">
//                         <label>Escribe tu Javascript aquí</label>
//                         <div id="editJSText"></div>
//                     </div>
//                     <div class="field">
//                         <button class="ui button" onclick="saveEditJS();">Guardar</button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//         <div class="ui modal" id="newPageModal">
//             <style>
//                 .itemMenu {
//                     border: 1px solid rgba(0,0,0,.4);
//                     border-radius: 4px;
//                     box-shadow: 2px 2px 4px #888888;
//                     width: 100px;
//                     height: 130px;
//                     cursor: pointer;
//                     padding-top: 1rem !important;
//                 }
//             </style>
//             <i class="close icon"></i>
//             <div class="header">Carga una plantilla predefinida.</div>
//             <div class="content" style="text-align: center; padding: 2rem;">
//                 <div class="ui horizontal stackable list">
//                     <div class="item itemMenu" onclick="newPage('noticia')">
//                         <img src="./images/noticias.png" width="40"/>
//                         <h5>Noticia</h5>
//                     </div>
//                     <div class="item itemMenu" onclick="newPage('contacto')">
//                         <img src="./images/formulario.png" width="40"/>
//                         <h5>Formulario</h5>
//                     </div>
//                     <div class="item itemMenu" onclick="newPage('faq')">
//                         <img src="./images/plantilla2.png" width="40"/>
//                         <h5>FAQ</h5>
//                     </div>
//                     <div class="item itemMenu" onclick="newPage('grupoNoticias')">
//                         <img src="./images/plantilla3.png" width="40"/>
//                         <h5>Grupo Noticias</h5>
//                     </div>
//                     <div class="item itemMenu" onclick="newPage('empty')">
//                         <img src="./images/empty_page.png" width="40"/>
//                         <h5>En blanco</h5>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     `;

//     // Añadimos los modales que definen los componentes

//     modal += componentModal();

//     return modal;
// }

function abrirSegmentoRef() {
    var ref = selectedItem.getAttribute("data-ref");
    if (!ref) return;

    // var ref_array = ref.split("#");
    // window.open('?' + ref_array[0], '');
    window.open('?' + ref, '')
}

/************************** */

function getLocalized(item, locale = null) {
    if (typeof item === 'string')
        return item
    if (!locale)
        locale = getLocale()

    if (locale === 'va' && !item[locale]) locale = 'ca'
    else if (locale === 'ca' && !item[locale]) locale = 'va'

    if (typeof item === 'object') {
        let resp = item[locale] || item.und || item.es || item.va || item.ca || item[0] || '';
        //console.log("ES UN OBJETO", resp)
        return resp
    }
}

// Devuelve el valor original de creación de un elemento
// Se construye a partir del valor del path en pageData

function infoItem() {
    var path = $(selectedItem).data("path");
    var res = getDataPath(pageData, path);
    $("#jsonModal .content").html(res);
    $("#jsonModal").modal("show");
}

function getDataPath(data, path) {
    //console.log(path, data);
    if (path === undefined) return "";

    var parts = path.split(".");
    var key = array_shift(parts);
    if (parts.length === 0) {
        if (typeof data[key] === "string") return infoJsonElement(data);
        else return infoJsonElement(data[key]);
    } else {
        return getDataPath(data[key], parts.join("."));
    }
}

function getDataPathArray(data, path) {
    if (path === undefined) return "";

    var parts = path.split(".");
    var key = array_shift(parts);
    if (parts.length === 0)
        return data[key];
    else
        return getDataPathArray(data[key], parts.join("."));

}

/**Genera una lista HTML desplegable a partir del objeto data.  */
function infoJsonElement(data) {
    var html = `<div class="ui list">`;
    for (var elem in data) {
        html += `<div class="item">`;
        if (typeof data[elem] === "object") {
            html +=
                `<b class="headList" style="cursor: pointer;"><u>` +
                elem +
                "</u></b> => " +
                infoJsonElement(data[elem]);
        } else {
            html +=
                `<b class="headList" style="cursor: pointer;">` +
                elem +
                "</b> = " +
                data[elem];
        }
        html += "</div>";
    }
    html += "</div>";
    return html;
}
/**Maneja el evento click de los elementos de la lista generada. Oculta o muetras los hijos. */
$(document).on("click", ".headList", function() {
    console.log("CLICK slideToggle")
    $(this)
        .next()
        .slideToggle();
});


function lee_json(url) {
    $.getJSON(url, function(datos) {});
}

function readTextFile(file, callback = null) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            if (callback)
                callback(rawFile.responseText);
            else return rawFile.responseText;
        }
    }
    rawFile.send(null);
}




/**Abre un modal con un listado de páginas guardadas en la api */

/**Abre un modal con un listado de páginas guardadas en la api */

function unicID(params) {
    return params + Math.floor(Math.random() * 100) + params + Math.floor(Math.random() * 100);
}

function toggleMenuList(e) {
    if ($(e.nextElementSibling).is(":visible")) {
        $(e.nextElementSibling).slideUp();
        e.querySelector(".angle.down.icon").style.display = "inline";
        e.querySelector(".angle.right.icon").style.display = "none";
    } else {
        $('.webItem').slideUp();
        $("#apiListModal .list .angle.right.icon").hide();
        $("#apiListModal .list .angle.down.icon").show();
        $(e.nextElementSibling).slideDown();
        e.querySelector(".angle.right.icon").style.display = "inline";
        e.querySelector(".angle.down.icon").style.display = "none";
    }
}

/**Muestra mensajes en página principal */
function viewMainMessage(type, body, close , config) {

    let iconClasses = "",
        classes = "",
        message = document.getElementById("zity-message")
    message.className = "ui message";
    message.innerHTML = "";

    if (type == "positive"){
        classes = "msg-positive";
        iconClasses = "check green icon";
    }
    if (type == "error"){
        classes = "msg-error";
        iconClasses = "times red icon";
    }

    message.classList.add(classes)

    message.innerHTML = `<i class="${iconClasses}"></i>
                        ${body}`;
    $(message).show();
    // $(message).animate({
    //     top: "-=8%",
    // },"slow");
    setTimeout(function () {
        $(message).fadeOut(400, function() {
            this.className = "ui message";
            this.innerHTML = "";
        });
    }, 700)

}

function ZityMessage(msg){
    const date = new Date();
    const time = date.toLocaleTimeString('es-ES',{hour: '2-digit', minute:'2-digit',second: '2-digit'});

    const item = {
        time,
        ...msg
    }

    const container = document.getElementById("zity-message-block");

    if(container.style.position != "fixed"){
        container.style.position = "fixed";
        container.style.bottom = "3px";
        container.style.zIndex = "3500";
        container.style.left = "60%";
        container.style.display = "flex";
        container.style.flexDirection = "column";
        container.style.alignItems = "baseline";
    }
    const n = container.children.length;
    if(n === 2){
       clearFirstChild()
    }

    const message = Msg(item);

    container.appendChild(message);

    message.addEventListener("click", function(){
       this.remove();
       // messages.splice(index,1)
    })

    function Msg(msg){
        const elem = document.createElement("div");
        elem.style.margin =  0;
        elem.style.marginBottom =  "-20px";
        elem.style.padding = "5px 8px";
        elem.style.borderRadius = 0;
        elem.style.display = "flex";
        elem.style.flexDirection = "row";
        elem.style.fontSize = "12px";
        elem.style.gap = "1em";
        elem.className = "ui inverted message";

        let iconClasses;

        if (msg.success){
            iconClasses = "check green icon";
        }
        if (msg.error){
            iconClasses = "times red icon";
        }
        if(msg.info){
            iconClasses = "exclamation triangle icon";
        }

        elem.innerHTML = `
            <em>${msg.time}</em>
            <div class="content">
                <a>${msg.name}</a>
                ${msg.body}
                <i class="${iconClasses}" style="margin-left: 1rem"></i>
            </div>`;

        elem.addEventListener("DOMNodeInserted", function (ev) {
            $(this).animate({
                marginBottom: "+=25px"
            }, "slow")
            setTimeout(()=>clearFirstChild(), 8000)
        }, false);

        return elem;
    }
    function clearFirstChild(){
        if(container &&  container.children && container.children[0])
            container.children[0].remove()
    }
}

/******************************************* */

function viewMode() {
    $("#main").off("click", "*");
    $("#main").attr("editionmode", "0");
}


/********************** */

function array_shift(inputArr) {
    var _checkToUpIndices = function(arr, ct, key) {
        if (arr[ct] !== undefined) {
            var tmp = ct;
            ct += 1;
            if (ct === key) {
                ct += 1;
            }
            ct = _checkToUpIndices(arr, ct, key);
            arr[ct] = arr[tmp];
            delete arr[tmp];
        }

        return ct;
    };

    if (inputArr.length === 0) {
        return null;
    }
    if (inputArr.length > 0) {
        return inputArr.shift();
    }
}

function formatDate(date) {
    var d = new Date(date),
        month = "" + (d.getMonth() + 1),
        day = "" + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
}

function addDayToDate(fecha) {
    var date = new Date(fecha);
    var newdate = new Date(date);

    newdate.setDate(newdate.getDate() + 1);

    var dd = newdate.getDate();
    var mm = newdate.getMonth() + 1;
    var y = newdate.getFullYear();

    return y + "-" + mm + "-" + dd;
}

/**
 *
 * Funciones Drag & Drop
 *
 */

var dragSrcEl = null;

function handleDragStart(e) {
    if (e.stopPropagation) e.stopPropagation();
    //console.log(">>>COGIDO>>>", this)
    dragSrcEl = this;
    e.dataTransfer.effectAllowed = "move";
    if (this.hasAttribute("data-component"))
        e.dataTransfer.setData("text/html", this.outerHTML);
    else
        e.dataTransfer.setData("text/html", this.innerHTML);
}

function handleDragOver(e) {
    if (e.preventDefault) e.preventDefault();
    if (e.stopPropagation) e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    //console.log(">>>MOVIENDO>>>", e);
    return false;
}

function handleDragEnter(e) {
    addClass(this, "over");
}

function handleDragLeave(e) {
    removeClass(this, "over");
}

function handleDrop(e) {
    if (e.stopPropagation) e.stopPropagation();
    if (dragSrcEl !== this) {
        dragSrcEl.innerHTML = this.innerHTML;
        this.innerHTML = e.dataTransfer.getData('text/html');
    }

    return false;
    // console.log(">>>>SOLTADO>>>>>", this,dragSrcEl,e.target,e.dataTransfer.getData("text/html"))

  //  console.log("DRAG",e.target.dataset.editor,this.dataset.editor,this.hasAttribute("data-component"),e.target,e.target.parentNode)
    if (dragSrcEl != this && e.target.dataset.editor === this.dataset.editor) {

        if ( this.hasAttribute("data-component")) {
            dragSrcEl.outerHTML = this.outerHTML;
            this.outerHTML = e.dataTransfer.getData("text/html");
        } else {
            // Añadir un hijo
            // let child = segment_render("fila")
            // e.target.appendChild(child)
            // child.innerHTML = e.dataTransfer.getData("text/html")

            // Añadir un hermano
            // let child = segment_render("columna")
            // e.target.parentNode.appendChild(child)
            // child.innerHTML = e.dataTransfer.getData("text/html")

            // Adjacente
            // let adjacent = e.target.insertAdjacentElement("afterend", segment_render("columna"))
            // var clone = document.importNode(dragSrcEl, false); // los hijos no se copian
            // let adjacent = e.target.insertAdjacentElement("afterend", clone)

            console.log(e.target,dragSrcEl)
            e.target.innerHTML = dragSrcEl.innerHTML
            console.log(e.target,dragSrcEl)

            // No tiene porque ser columna, puede ser lo que sea.!!!
            // let adjacent =  hasClass(e.target, "column")
            //     ? e.target.insertAdjacentElement("afterend", segment_render("column"))
            //     : selectedItem.dataset.editor == "segment"
            //     ? e.target.insertAdjacentElement("afterend", segment_render("fila"))
            //     : e.target.closest(".column").insertAdjacentElement("afterend", segment_render("column"))
            // adjacent.innerHTML = e.dataTransfer.getData("text/html")

            //Sustitución del segmento
            // e.target.innerHTML = e.dataTransfer.getData("text/html")
            dragSrcEl.innerHTML = ''

        }
    }
    return false;
}

function handleDragEnd(e) {
    if (e.stopPropagation) e.stopPropagation();
    var cols = document.querySelectorAll("[draggable]");
    document.querySelector(".is-dragging").classList.remove("is-dragging")
    
    Array.from(cols).map( col => removeClass(col, "over"))
    // [].forEach.call(cols, function(col) {
    //     removeClass(col, "over");
    // });
}

//segcom: segment-component =>item
// Saca enlaces href de toda la página

function mapaWeb(item) {
    return [
        ...(item.href ? [item.href] : []),
        ...(item.segments ? item.segments.map(s=>mapaWeb(s)) : []),
        ...(item.components ? item.components.map(s=>mapaWeb(s)) : [])
    ].flat()
}

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    console.log('Query variable %s not found', variable);
}

/**Pinta en el menu las plantillas obtenidas de un web en concreto */
// async function openImportSegment() {
//     var realm = getRealm();
//     var plantillas = await fetchJSON(API + `${realm}/collections/paginas/?templates`);

//     if (plantillas && plantillas.items && plantillas.items.length > 0) {
//         var html = ``;
//         plantillas.items.map(function(_web) {
//             var id = _web._id;
//             var segments = _web.segments;
//             if (segments)
//                 for (var i = 0; i < segments.length; i++) {
//                     if (segments[i].name || segments[i].title) {
//                         html += `
//                             <div class="item">
//                                 <div title="${segments[i].name}" onclick="importSegment('${id}', '${segments[i].name}')"><span class="text">(${_web.web}) ${segments[i].name||segments[i].title}</span></div>
//                             </title
//                             `;
//                     }
//                 }
//         });
//         console.log("html",html)
//         document.getElementById("openImportSegmentMenu").innerHTML = html;
//     } else
//         viewMainMessage("error", "<p>Esta web no contiene pantillas</p>");
// }

/**Pinta en el menu las plantillas obtenidas de un web en concreto */
async function openImportSegment() {
    const realm = getRealm();
    const plantillas = await fetchJSON(API + `${realm}/collections/paginas/?templates`);
    //console.log(plantillas)
    if (plantillas && plantillas.items && plantillas.items.length > 0) {
        let html = ``;
        plantillas.items.map(function(_web) {
            const id = _web._id;
            const segments = _web.segments;
            if (segments)
                segments.map( segment => {
                    const { title, name, thumbnail } = segment;
                    if (!name && !title) return "";
                    let contentHtml = ""
                    if(thumbnail){
                        contentHtml = `<div class="ui dropdown item">
                                            <i class="dropdown icon"></i>
                                            (${_web.web}) ${name || title}
                                            <div class="menu" style="right: 110%!important;">
                                                <img src="${thumbnail}" />
                                            </div>
                                        </div>`

                    }else{
                        contentHtml = `<div class="title">(${_web.web}) ${name || title}</div>`
                    }
                    html += `
                        <div class="item" title="${name}" onclick="importSegment('${id}', '${name}')">
                            ${contentHtml}
                        </div>
                        `;

                })
        });
       // console.log("html",html)
        document.getElementById("openImportSegmentMenu").innerHTML = html;
    } else
        viewMainMessage("error", "Esta se ha encontrado ninguna pantilla");
}


function getFechaTexto(date) {
    var day = new Array("Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo");
    var month = new Array("Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre");
    var today;
    if (date)
        today = new Date(date);
    else
        today = new Date();
    var year = today.getFullYear();
    var fecha = day[today.getDay()] + ", " + today.getDate() + " de " + month[today.getMonth()] + " de " + year + ". ";
    return fecha;
}

var resolved = {};

function loadRenderScript(scriptUrl) {
    let el = document.querySelector(`script[src="${scriptUrl}"]`);
    if (!el) {
        resolved[scriptUrl] = new Promise((resolve, reject) => {
            // console.log('elemento NO existe','Descargando',scriptUrl);
            el = document.createElement('script');
            el.src = scriptUrl;
            document.body.appendChild(el);
            el.addEventListener('load', function(script) {
                resolve();
                // console.log(scriptUrl + ' loaded!');
            })
        })
    }
    // console.log('Devolviendo Promesa',scriptUrl)
    return resolved[scriptUrl];
};

var resolvedCSS = {};

function loadCss(filename) {
    let el = document.querySelector(`link[href="${filename}"]`);
    if (!el) {
        resolvedCSS[filename] = new Promise((resolve, reject) => {
            el = document.createElement('link');
            el.setAttribute("rel", "stylesheet");
            el.setAttribute("type", "text/css");
            el.setAttribute("href", filename);
            document.body.appendChild(el);
            el.addEventListener('load', function(data) {
                resolve();
            })
        })
    }
    return resolvedCSS[filename];
}

function ActualizarPagina() {
    pageData.segments = segment_toJson(document.getElementById("main").children)
    renderPage(pageData)
}

//Añade los hijos a un componente
function renderChildren(component, children) {
    for (var i = 0; i < children.length; i++) {
        let segment = segment_render("", children[i])
        component.appendChild(segment)
    }
}
//Modifica el valor pasado del elemento seleccionado
function changeValue(name, value) {
    selectedItem.dataset[name] = value
}
//Añade un nuevo hijo segment al elemento seleccionado
function addChildren() {
    let segment = segment_render("", {type: "segment"})
    selectedItem.appendChild(segment)
}
//Genera un formulario de edicion para componente. data es el json del componente, fields los campos modificables
function componentEditionForm(data, fields = []) {
    let html = `<div class="ui small form">`
    fields.forEach(f => {
        html += `
        <div class="field">
            <label>${f}</label>
            <input value="${data[f]}" onchange="changeValue('${f}', this.value)"/>
        </div>`
    })
    html += `
        <div class="field">
            <div class="ui green button" onclick="ActualizarPagina()">Actualizar</div>
        </div>
    </div>`
    return html
}
//Genera el botón de edicion de componente junto con el formulario. component es el componente (dom) en el que se va a crear,
//data es el json del componente y fields los campos editables.
function ComponentOptionsButtons() {
    let tab = 0
    let htmlPreview
    return {
        oninit: async ({attrs}) => {
            const { preview } = attrs
            if (typeof preview === 'function')
                htmlPreview = await preview()
            else if (typeof preview === "string")
                htmlPreview = preview
        },
        view: ({attrs}) => {
            const { data, fields, preview } = attrs
            return m(".component-controller", {
                style: "position: absolute; top: 0; left: 0; z-index: 1; width: 100%;"
            }, [
                m(".ui.mini.circular.icon.button.component-controller-form-button", {
                    onclick: () => tab = tab === 1 ? 0 : 1,
                    className: tab === 1 ? "active" : undefined
                }, m("i.cog.icon")),

                m(".ui.mini.circular.icon.button.component-controller-form-button", {
                    onclick: () => tab = tab === 2 ? 0 : 2,
                    className: tab === 2 ? "active" : undefined
                }, m("i.eye.icon")),

                tab === 1
                ? m(".ui.tertiary.segment.component-controller-form", {
                    style: "max-height: 500px; overflow: auto;"
                }, m.trust(componentEditionForm(data, fields)))
                : null,

                tab === 2
                ? m(".ui.segment.component-controller-preview", {
                    style: "max-height: 600px; overflow: auto;"
                },
                    typeof htmlPreview === "string"
                    ? m.trust(htmlPreview)
                    : htmlPreview,
                )
                : null
            ])
        }
    }
}

