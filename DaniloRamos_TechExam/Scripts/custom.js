$(document).ready(function () {
    loadType();
    loadItem();
});

$('#btnReset').on('click', function () {
    clearType();
});
$('#btnResetItem').on('click', function () {
    clearItem();
});
$('#RecyclableTypeId').on('change', function () {
    $('#Weight').val("");
    typeID = $('#RecyclableTypeId').val();
    getRType(typeID);
});

$('#Weight').on('keyup', function () {
    var rateTotal = parseFloat($('#rateTotal').val()) || 0;
    var weight = parseFloat($('#Weight').val()) || 0;
    var computedRate = rateTotal * weight;
    $('#ComputedRate').val(isNaN(computedRate) ? '0.00' : computedRate.toFixed(2));
});

function loadType() {
    table = CreateDataTablesFormat("tblRecyclableType", "/Recyclable/listType",
        [
            { data: "id", visible: false, searchable: false },
            { data: "Type", title: "Type", width: "10px" },
            { data: "Rate", title: "Rate", width: "-2px" },
            { data: "MinKg", title: "MinKg", width: "-2px" },
            { data: "MaxKg", title: "MaxKg", width: "-2px" },
            {
                data: "id", title: "ACTION", width: "12%", render: function (data) {
                    return `<button type='button' class='btn btn-warning btn-sm flat' onclick='getTypeById(${data})'>Edit</button>` +
                        `<button type='button' class='btn btn-danger btn-sm flat btn_delete' data-id='${data}'>Delete</button>`;
                }
            }
        ]
    );
    $("#tblRecyclableType tbody").on("click", "tr", function (e) {
        var id = '';
        if (!$(this).hasClass("dtactive")) {
            $(this).parent().find("tr").removeClass("dtactive");
            $(this).addClass("dtactive");
            id = table.row(this).data().id;
        }
        $(".btn_delete").click(function () {
            $("#modalconfirm").modal("show");
            $(".btn-yesno").click(function () {
                deleteType(id);
            });
        });

    });
}
function loadItem() {
    table = CreateDataTablesFormat("tblRecyclableItem", "/Recyclable/listItem",
        [
            { data: "id", title: "", visible: false, searchable: false },
            { data: "Type", title: "Type", width: "10px", orderable: false },
            { data: "ItemDescription", title: "Item Description", width: "-2px", orderable: false },
            { data: "Weight", title: "Weight", width: "-2px", orderable: false },
            { data: "ComputedRate", title: "Computed Rate", width: "-2px", orderable: false },
            {
                "data": "id", "title": "ACTION", "width": "11%", "render": function (data) {
                    return "<button type='button' class='btn btn-warning btn-sm flat' onclick='getItemById(" + data + ")'>Edit</button>" +
                        " <button type='button' class='btn btn-danger btn-sm flat btn_delete'>Delete</button>";
                }
            }
        ]
    );
    $("#tblRecyclableItem tbody").on("click", "tr", function (e) {
        var id = '';
        if (!$(this).hasClass("dtactive")) {
            $(this).parent().find("tr").removeClass("dtactive");
            $(this).addClass("dtactive");
            id = table.row(this).data().id;
        }
        $(".btn_delete").click(function () {
            $("#modalconfirm").modal("show");
            $(".btn-yesno").click(function () {
                deleteItem(id);
            });
        });

    });
}

function deleteType(id) {
    fncExecute2('/Recyclable/DeleteType/', { ID: id },
        function (response) {
            $("#modalconfirm").modal("hide");
            clearType();
            loadType();
        }
    );
}
function deleteItem(id) {
    fncExecute2('/Recyclable/DeleteItem/', { ID: id },
        function (response) {
            $("#modalconfirm").modal("hide");
            clearItem();
            loadItem();
        }
    );
}

function getRType(id) {
    $.ajax({
        url: "/Recyclable/GetType/" + id,
        type: "POST",
        dataType: "json",
        success: function (res) {
            $('#MinKg').val(res.MinKg);
            $('#MaxKg').val(res.MaxKg);
            $('#rateTotal').val(res.Rate);
        },
        error: function (error_msg) {
            alert(error_msg.responseText);
        }
    });
}

function Add() {
    var res = validateType();

    if (res === false) {
        return false;
    }

    var rType = {
        id: $('#id').val(),
        Type: $('#Type').val(),
        Rate: $('#Rate').val(),
        MinKg: $('#MinKg').val(),
        MaxKg: $('#MaxKg').val()
    };

    console.log(rType);

    $.ajax({
        url: "/Recyclable/saveRecyclable",
        type: "POST",
        data: JSON.stringify(rType),
        contentType: "application/json;charset=utf-8",
        dataType: "Json",
        success: function (response) {
            alert(response);
            loadType();
            clearType();
            $("#emp_modal").modal("hide");
        },
        error: function (error_msg) {
            alert(error_msg.responseText);
        }
    });
}

function AddItem() {
    var res = validateItem();

    if (res === false) {
        return false;
    }

    var rItem = {
        id: $('#id').val(),
        RecyclableTypeId: $('#RecyclableTypeId').val(),
        ItemDescription: $('#ItemDescription').val(),
        Weight: $('#Weight').val(),
        ComputedRate: $('#ComputedRate').val()
    };

    var data = JSON.stringify({
        rItem: rItem,
        MinKg: parseFloat($('#MinKg').val()),
        MaxKg: parseFloat($('#MaxKg').val())
    });

    console.log(data);

    $.ajax({
        url: "/Recyclable/saveRecyclableItem",
        type: "POST",
        data: data,
        contentType: "application/json;charset=utf-8",
        dataType: "Json",
        success: function (response) {
            if (response.msg2) {
                alert(response.msg2); 
            } else {
                alert(response.msg); 
                loadItem();
                clearItem();
                $("#item_modal").modal("hide");
            }
        },
        error: function (error_msg) {
            alert(error_msg.responseText);
        }
    });
}


function getTypeById(id) {
    $.ajax({
        url: "/Recyclable/GetType/" + id,
        type: "POST",
        dataType: "json",
        success: function (res) {
            console.log(res);

            $("#emp_modal").modal("show");
            $('#id').val(res.id);
            $('#Type').val(res.Type);
            $('#Rate').val(res.Rate);
            $('#MinKg').val(res.MinKg);
            $('#MaxKg').val(res.MaxKg);
        },
        error: function (error_msg) {
            alert(error_msg.responseText);
        }
    });
}

function getItemById(id) {
    $.ajax({
        url: "/Recyclable/GetItem/" + id,
        type: "POST",
        dataType: "json",
        success: function (res) {
            console.log(res);

            if (res && res.data && res.data.length > 0) {
                var item = res.data[0]; 
                $("#item_modal").modal("show");
                $('#id').val(item.ItemId);
                $('#RecyclableTypeId').val(item.TypeId);
                $('#ItemDescription').val(item.ItemDescription);
                $('#Weight').val(item.Weight);
                $('#ComputedRate').val(item.ComputedRate) ? '0.00' : computedRate.toFixed(2);
            } else {
                alert("No data found!");
            }
        },
        error: function (error_msg) {
            alert(error_msg.responseText);
        }
    });
}

function clearType() {
    $('#id').val("");
    $('#Type').val("");
    $('#Rate').val("");
    $('#MinKg').val("");
    $('#MaxKg').val("");
    $('#id').css('border-color', 'lightgrey');
    $('#Type').css('border-color', 'lightgrey');
    $('#Rate').css('border-color', 'lightgrey');
    $('#MinKg').css('border-color', 'lightgrey');
    $('#MaxKg').css('border-color', 'lightgrey');
}

function clearItem() {
    $('#id').val("");
    $('#RecyclableTypeId').val("");
    $('#Description').val("");
    $('#Weight').val("");
    $('#ComputedRate').val("");
    $('#RecyclableTypeId').css('border-color', 'lightgrey');
    $('#Description').css('border-color', 'lightgrey');
    $('#Weight').css('border-color', 'lightgrey');
    $('#ComputedRate').css('border-color', 'lightgrey');
}

function validateType() {
    var isValid = true;
    if ($('#Type').val().trim() === "") {
        $('#Type').css('border-color', 'red');
        isValid = false;
    }
    else {
        $('#Type').css('border-color', 'lightgrey');
    }

    if ($('#Rate').val().trim() === "") {
        $('#Rate').css('border-color', 'red');
        isValid = false;
    }
    else {
        $('#Rate').css('border-color', 'lightgrey');
    }

    if ($('#MinKg').val().trim() === "") {
        $('#MinKg').css('border-color', 'red');
        isValid = false;
    }
    else {
        $('#MinKg').css('border-color', 'lightgrey');
    }

    if ($('#MaxKg').val().trim() === "") {
        $('#MaxKg').css('border-color', 'red');
        isValid = false;
    }
    else {
        $('#MaxKg').css('border-color', 'lightgrey');
    }

    return isValid;
}

function validateItem() {
    var isValid = true;
    if ($('#RecyclableTypeId').val().trim() === "") {
        $('#RecyclableTypeId').css('border-color', 'red');
        isValid = false;
    }
    else {
        $('#RecyclableTypeId').css('border-color', 'lightgrey');
    }

    if ($('#ItemDescription').val().trim() === "") {
        $('#ItemDescription').css('border-color', 'red');
        isValid = false;
    }
    else {
        $('#ItemDescription').css('border-color', 'lightgrey');
    }

    if ($('#Weight').val().trim() === "") {
        $('#Weight').css('border-color', 'red');
        isValid = false;
    }
    else {
        $('#Weight').css('border-color', 'lightgrey');
    }

    if ($('#ComputedRate').val().trim() === "") {
        $('#ComputedRate').css('border-color', 'red');
        isValid = false;
    }
    else {
        $('#ComputedRate').css('border-color', 'lightgrey');
    }

    return isValid;
}

function CreateDataTablesFormat(table_name, ajax_url, table_column) {
    var data_table = $("#" + table_name).DataTable({
        destroy: true,
        responsive: true,
        processing: true,
        search: true,
        stateSave: true,
        searching: true,
        paging: true,
        info: true,
        pageLength: 5,
        order: [[1, "asc"], [2, "asc"]],
        lengthMenu: [[5, 10, 15, -1], [5, 10, 15, "All"]],
        ajax: {
            "url": ajax_url
        },
        columns: table_column
    });
    return data_table;
}

function fncExecute2(url, data, success, type) {
    var result;
    $.ajax({
        type: type === undefined ? "POST" : type,
        url: url,
        data: data,
        async: false,
        success: success
    });
    return result;
}