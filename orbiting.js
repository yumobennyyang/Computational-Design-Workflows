import * as THREE from 'https://unpkg.com/three@0.157.0/build/three.module.js';

function initOrbitingScene(containerId) {
    const container = document.getElementById(containerId);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf2f2f2);

    const camera = new THREE.PerspectiveCamera(45, container.offsetWidth / 400, 0.1, 1000);
    camera.position.set(5, 5, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.offsetWidth, 400);
    container.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(5, 5, 5);
    scene.add(ambient, dirLight);

    const material1 = new THREE.MeshStandardMaterial({ color: '#ff3e00' });
    const material2 = new THREE.MeshStandardMaterial({ color: '#1d9bf0' });
    const material3 = new THREE.MeshStandardMaterial({ color: '#ffb703' });

    const cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material1);
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.6, 32, 32), material2);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.5, 32), material3);

    cube.position.x = -1.5;
    sphere.position.x = 1.5;
    cone.position.y = 1.5;

    scene.add(cube, sphere, cone);

    let angle = 0;
    function animate() {
        requestAnimationFrame(animate);
        angle += 0.005;
        camera.position.x = 5 * Math.sin(angle);
        camera.position.z = 5 * Math.cos(angle);
        camera.lookAt(scene.position);

        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        sphere.rotation.y += 0.005;
        cone.rotation.z += 0.01;

        renderer.render(scene, camera);
    }

    animate();
}

window.addEventListener('DOMContentLoaded', () => {
    initOrbitingScene('three-canvas-1');
});
