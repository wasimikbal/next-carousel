'use client'
import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import {
    CSS2DRenderer,
    CSS2DObject,
} from "three/addons/renderers/CSS2DRenderer.js";

const ConfigDialog = ({ isOpen, onClose }) => {

    const dialogRef = useRef(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [model, setModel] = useState<THREE.Group | null>(null);

    const createCPointMesh = (name, x, y, z) => {
        const geo = new THREE.SphereGeometry(1);
        const mat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, z);
        mesh.name = name;
        return mesh;
    };

    const createCubeMesh = (name, x, y, z) => {
        const geo = new THREE.BoxGeometry(10, 10, 1);
        const mat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, z);
        mesh.name = name;
        return mesh;
    };

    useEffect(() => {
        const dialog = dialogRef.current;
        if (isOpen) {
            dialog.showModal();
        } else {
            dialog.close();
        }
    }, [isOpen]);

    useEffect(() => {

        const labelRenderer = new CSS2DRenderer();
        labelRenderer.setSize(window.innerWidth, window.innerHeight);
        labelRenderer.domElement.style.position = "absolute";
        labelRenderer.domElement.style.top = "0px";
        labelRenderer.domElement.style.pointerEvents = "none";
        document.body.appendChild(labelRenderer.domElement);

        const bannerSize = { width: canvasRef.current.clientWidth, height: canvasRef.current.clientHeight }
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, bannerSize.width / bannerSize.height, 0.1, 1000);
        camera.position.z = 50;

        const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true, alpha: true });
        renderer.setSize(bannerSize.width, bannerSize.height);
        renderer.setPixelRatio(window.devicePixelRatio);

        const p = document.createElement("p");
        p.className = "tooltip";
        const pContainer = document.createElement("div");
        pContainer.appendChild(p);
        const cPointLabel = new CSS2DObject(pContainer);
        scene.add(cPointLabel);

        const mousePosition = new THREE.Vector2();
        const raycaster = new THREE.Raycaster();

        const rayMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
        const rayGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(),
            new THREE.Vector3()
        ]);
        const rayLine = new THREE.Line(rayGeometry, rayMaterial);
        scene.add(rayLine);

        const intersectionSphere = new THREE.Mesh(
            new THREE.SphereGeometry(1),
            new THREE.MeshBasicMaterial({ color: 0x0000ff })
        );
        scene.add(intersectionSphere);

        const meshRight = createCubeMesh("Foam right", 0, 0, 0);
        const meshLeft = createCubeMesh("Foam left", 0, 0, 0);
        const group = new THREE.Object3D;
        group.add(meshLeft);
        group.add(meshRight);

        window.addEventListener("mousedown", (e) => {

            mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
            mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;



            raycaster.setFromCamera(mousePosition, camera);

            const intersects = raycaster.intersectObjects(scene.children, true);

            if (intersects.length > 0) {
                const intersect = intersects[0];

                rayLine.geometry.setFromPoints([
                    raycaster.ray.origin,
                    intersect.point,
                ]);
                console.log(intersect.point);
                const obj = intersect.object;
                p.className = "tooltip show";
                cPointLabel.position.set(obj.position.x, obj.position.y + 0.8, obj.position.z);
                p.textContent = `${obj.name}`;

                intersectionSphere.position.copy(intersect.point);
            } else {
                p.className = "tooltip hide";
            }
        });


        const modelLoader = new GLTFLoader();
        modelLoader.load('/headphones.glb', (gltf) => {
            const loadedModel = gltf.scene;
            loadedModel.position.set(0, -5, 0);
            loadedModel.scale.set(0.05, 0.05, 0.05);
            loadedModel.add(group);

            meshRight.scale.set(1 / 0.05, 1 / 0.05, 1 / 0.05);
            meshRight.rotation.set(0, Math.PI / 2, 0);
            meshRight.position.set(0, 0, 0);

            meshLeft.scale.set(1 / 0.05, 1 / 0.05, 1 / 0.05);
            meshLeft.rotation.set(0, Math.PI / 2, 0);
            meshLeft.position.set(-300, 0, 0);

            scene.add(loadedModel);
            setModel(loadedModel);
        });

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.enablePan = false;
        controls.enableZoom = true;
        controls.autoRotate = false;
        controls.autoRotateSpeed = 2;

        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 2;

        const skyboxTextureUrl = '/room.hdr';
        const hdriLoader = new RGBELoader().setDataType(THREE.HalfFloatType)
        hdriLoader.load(skyboxTextureUrl, function (texture) {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            scene.environment = texture;
        });

        const animate = () => {
            controls.update();
            renderer.render(scene, camera);
            labelRenderer.render(scene, camera);
            requestAnimationFrame(animate);
        };

        animate();

    }, [canvasRef]);

    return (
        <>
            <dialog ref={dialogRef} className='dialog'>
                <canvas ref={canvasRef} className='dialog-canvas'></canvas>
                <button className='dialog-close-button' onClick={onClose}>x</button>
                {(!model) && <h1>Loading ...</h1>}
            </dialog>

            <style jsx>
                {`
                `}
            </style>
        </>
    );
};

export default ConfigDialog;
