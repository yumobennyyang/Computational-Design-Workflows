import * as THREE from 'https://unpkg.com/three@0.157.0/build/three.module.js';

function initMaterialFogScene(containerId) {
    const container = document.getElementById(containerId);
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xccccff, 5, 15);
    scene.background = new THREE.Color(0xeeeeff);

    const camera = new THREE.PerspectiveCamera(60, container.offsetWidth / 400, 0.1, 100);
    camera.position.set(4, 4, 8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.offsetWidth, 400);
    container.appendChild(renderer.domElement);

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.3);
    const point = new THREE.PointLight(0xffccaa, 1.2, 100);
    point.position.set(3, 5, 3);
    scene.add(ambient, point);

    // Materials
    const metal = new THREE.MeshStandardMaterial({
        color: 0x6699ff,
        metalness: 0.8,
        roughness: 0.3
    });
    const glass = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0,
        roughness: 0,
        transmission: 0.95,
        thickness: 1.0,
        transparent: true
    });
    const matte = new THREE.MeshStandardMaterial({
        color: 0xff8855,
        roughness: 1.0,
        metalness: 0.0
    });

    // Geometry
    const torus = new THREE.Mesh(new THREE.TorusKnotGeometry(1, 0.3, 100, 16), metal);
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), glass);
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), matte);

    torus.position.set(-2.2, 1, 0);
    sphere.position.set(2.2, 1, 0);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = 0;

    scene.add(torus, sphere, plane);

    function animate() {
        requestAnimationFrame(animate);
        torus.rotation.x += 0.01;
        torus.rotation.y += 0.01;
        sphere.rotation.y += 0.005;
        renderer.render(scene, camera);
    }

    animate();
}

window.addEventListener('DOMContentLoaded', () => {
    initMaterialFogScene('three-canvas-2');
});
