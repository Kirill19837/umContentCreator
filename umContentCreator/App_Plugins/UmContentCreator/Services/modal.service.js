angular.module('umbraco').factory('modalService', function () {
    let modal;
    let modalContent;
    const navigation = document.getElementById("navigation");
    
    return {
        openModal: function (event) {
            const button = event.target.closest("button");
            const uniqueId = button.getAttribute('unique-id');
            modal = document.getElementById('myModal' + uniqueId);
            modalContent = document.getElementById('myModalContent' + uniqueId);

            if (modal && modalContent) {
                navigation.classList.add("ng-hide");
                modal.style.display = "block";
                modalContent.style.display = "block";
            }

            window.addEventListener('mousedown', (event) => {
                this.closeOnOutsideClick(event);
            });
        },
        closeModal: function () {
            navigation.classList.remove("ng-hide");
            modal.style.display = "none";
            modalContent.style.display = "none";  
        },
        closeOnOutsideClick: function (event) {
            if (modalContent && !this.isDescendant(modalContent, event.target) && event.target !== modalContent && event.target.id !== "openModalButton") {
                modal.style.display = "none";
                modalContent.style.display = "none";
                navigation.classList.remove("ng-hide");
                window.removeEventListener('mousedown', (event) => {
                    this.closeOnOutsideClick(event);
                });
            }
        },
        isDescendant: function (parent, child) {
            let node = child.parentNode;

            if (node === null) {
                return false;
            }

            if (node === parent) {
                return true;
            }

            return this.isDescendant(parent, node);
        }
    }
});