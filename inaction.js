let inactivityTime = () => {
    let time,
        loader = document.querySelector('.invisible');

    // сюда можно добавить любой ивент.
    document.addEventListener('mousemove', resetTimer);
    document.addEventListener('keypress', resetTimer);

    function resetTimer() {
        loader.classList.add('invisible');
        clearTimeout(time);
        time = setTimeout(fn, 500000)
    }

    function fn() {
        loader.classList.remove('invisible');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    inactivityTime();
});
