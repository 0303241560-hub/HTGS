import { initializeApp } from
    "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getDatabase,
    ref,
    onValue,
    set,
    update,
    remove
} from
    "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";


// =====================================================
// FIREBASE CONFIG
// =====================================================

// TODO:
// Thay các giá trị bên dưới bằng Firebase Config
// của project HTGS của bạn.

const firebaseConfig = {

    apiKey: "AIzaSyBG8RRjqGi3-yJ50bKYHVLW8nrfmsUhUaI",

    authDomain: "htgs-31cb2.firebaseapp.com",

    databaseURL:
        "https://htgs-31cb2-default-rtdb.firebaseio.com",

    projectId: "htgs-31cb2",

    storageBucket:
        "htgs-31cb2.firebasestorage.app",

    messagingSenderId:
        "519972773883",

    appId:
        "1:519972773883:web:169ed96d36ae4ca5d9b55e"

};


// =====================================================
// KHỞI TẠO FIREBASE
// =====================================================

const app = initializeApp(firebaseConfig);

const database = getDatabase(app);


// =====================================================
// DOM
// =====================================================

const studentForm =
    document.getElementById("studentForm");

const studentIdInput =
    document.getElementById("studentId");

const studentNameInput =
    document.getElementById("studentName");

const rfidUidInput =
    document.getElementById("rfidUid");

const fingerprintIdInput =
    document.getElementById("fingerprintId");

const tableBody =
    document.getElementById("studentTableBody");

const emptyMessage =
    document.getElementById("emptyMessage");

const studentCount =
    document.getElementById("studentCount");

const searchInput =
    document.getElementById("searchInput");

const cancelBtn =
    document.getElementById("cancelBtn");

const formTitle =
    document.getElementById("formTitle");

const firebaseStatus =
    document.getElementById("firebaseStatus");

const statusDot =
    document.getElementById("statusDot");


// =====================================================
// BIẾN
// =====================================================

let students = {};

let editingStudentId = null;


// =====================================================
// LẤY DỮ LIỆU STUDENTS REALTIME
// =====================================================

const studentsRef = ref(database, "students");

onValue(
    studentsRef,
    (snapshot) => {

        students = snapshot.val() || {};

        renderStudents();

        firebaseStatus.textContent =
            "Firebase đã kết nối";

        statusDot.style.background =
            "green";
    },

    (error) => {

        console.error(error);

        firebaseStatus.textContent =
            "Lỗi kết nối Firebase";

        statusDot.style.background =
            "red";
    }
);


// =====================================================
// HIỂN THỊ SINH VIÊN
// =====================================================

function renderStudents() {

    const keyword =
        searchInput.value
            .trim()
            .toLowerCase();


    tableBody.innerHTML = "";


    const studentList =
        Object.values(students).filter(student => {

            return (

                student.studentId
                    ?.toLowerCase()
                    .includes(keyword)

                ||

                student.name
                    ?.toLowerCase()
                    .includes(keyword)

                ||

                student.rfidUid
                    ?.toLowerCase()
                    .includes(keyword)

            );

        });


    studentCount.textContent =
        `${Object.keys(students).length} sinh viên`;


    if (studentList.length === 0) {

        emptyMessage.style.display =
            "block";

        return;
    }


    emptyMessage.style.display =
        "none";


    studentList.forEach(
        (student, index) => {

            const row =
                document.createElement("tr");


            row.innerHTML = `
                <td>${index + 1}</td>
                <td>
                    ${student.studentId || ""}
                </td>
                <td>
                    ${student.name || ""}
                </td>
                <td>
                    ${student.rfidUid || ""}
                </td>
                <td>
                    ${student.fingerprintId || ""}
                </td>
                <td>
                    <div class="action-buttons">
                        <button
                            class="btn-edit"
                            onclick="editStudent('${student.studentId}')"
                        >
                            Sửa
                        </button>
                        <button
                            class="btn-delete"
                            onclick="deleteStudent('${student.studentId}')"
                        >
                            Xóa
                        </button>
                    </div>
                </td>
            `;


            tableBody.appendChild(row);

        }
    );
}


// =====================================================
// THÊM / SỬA SINH VIÊN
// =====================================================

studentForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const studentId =
            studentIdInput.value
                .trim()
                .toUpperCase();


        const name =
            studentNameInput.value.trim();


        const rfidUid =
            rfidUidInput.value
                .trim()
                .toUpperCase();


        const fingerprintId =
            Number(fingerprintIdInput.value);


        if (!studentId ||
            !name ||
            !rfidUid ||
            !fingerprintId) {

            alert(
                "Vui lòng nhập đầy đủ thông tin!"
            );

            return;
        }


        const studentData = {

            studentId: studentId,

            name: name,

            rfidUid: rfidUid,

            fingerprintId:
                fingerprintId

        };


        try {

            // -------------------------------
            // THÊM SINH VIÊN
            // -------------------------------

            if (!editingStudentId) {

                if (students[studentId]) {

                    alert(
                        "Mã sinh viên đã tồn tại!"
                    );

                    return;
                }


                await set(
                    ref(
                        database,
                        `students/${studentId}`
                    ),
                    studentData
                );


                alert(
                    "Thêm sinh viên thành công!"
                );

            }


            // -------------------------------
            // SỬA SINH VIÊN
            // -------------------------------

            else {

                await update(
                    ref(
                        database,
                        `students/${editingStudentId}`
                    ),
                    studentData
                );


                alert(
                    "Cập nhật sinh viên thành công!"
                );

            }


            resetForm();

        }

        catch (error) {

            console.error(error);

            alert(
                "Có lỗi khi lưu dữ liệu!"
            );

        }

    }
);


// =====================================================
// SỬA SINH VIÊN
// =====================================================

window.editStudent = function(studentId) {

    const student =
        students[studentId];


    if (!student) {

        alert(
            "Không tìm thấy sinh viên!"
        );

        return;
    }


    editingStudentId =
        studentId;


    studentIdInput.value =
        student.studentId || "";


    studentNameInput.value =
        student.name || "";


    rfidUidInput.value =
        student.rfidUid || "";


    fingerprintIdInput.value =
        student.fingerprintId || "";


    formTitle.textContent =
        "Chỉnh sửa sinh viên";


    cancelBtn.classList.remove(
        "hidden"
    );


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

};


// =====================================================
// XÓA SINH VIÊN
// =====================================================

window.deleteStudent =
    async function(studentId) {

        const student =
            students[studentId];


        if (!student) {

            return;
        }


        const confirmDelete =
            confirm(
                `Bạn có chắc muốn xóa ${student.name}?`
            );


        if (!confirmDelete) {

            return;
        }


        try {

            await remove(
                ref(
                    database,
                    `students/${studentId}`
                )
            );


            alert(
                "Xóa sinh viên thành công!"
            );

        }

        catch (error) {

            console.error(error);

            alert(
                "Không thể xóa sinh viên!"
            );

        }

    };


// =====================================================
// HỦY SỬA
// =====================================================

cancelBtn.addEventListener(
    "click",
    resetForm
);


// =====================================================
// RESET FORM
// =====================================================

function resetForm() {

    studentForm.reset();


    editingStudentId =
        null;


    formTitle.textContent =
        "Thêm sinh viên";


    cancelBtn.classList.add(
        "hidden"
    );

}


// =====================================================
// TÌM KIẾM
// =====================================================

searchInput.addEventListener(
    "input",
    renderStudents
);
