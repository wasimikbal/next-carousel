'use client'
import React, { MutableRefObject, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
type props = {
    scenesRef?: MutableRefObject<THREE.Scene>,
}

const ProductContainer: React.FC<props> = ({ scenesRef }) => {
    // The div element in which scene is to be rendered.
    const sceneContainerRef = useRef<HTMLDivElement>(null);

    // Model
    const [model, setModel] = useState<THREE.Object3D>(null);

    useEffect(() => {
        // Loading the model
        const loader = new GLTFLoader();
        loader.load('/model5.glb', (glb) => {
            setModel(glb.scene);
        })


    }, [])


    useEffect(() => {
        if (!sceneContainerRef.current || !model) return;
        const divContainer = sceneContainerRef.current;

        // Scene init
        const scene = new THREE.Scene();
        scene.add(model);
        console.log(model);

        // Camera
        const camera = new THREE.PerspectiveCamera(
            45,
            divContainer.clientWidth / divContainer.clientHeight,
            0.1,
            5000
        );
        camera.position.set(0, 0, 5);
        camera.lookAt(0, 0, 0);
        scene.add(camera);

        // Calculating the bounding box around the model to get it's size and center.
        const boundingBox = new THREE.Box3().setFromObject(model);
        const boxSize = boundingBox.getSize(new THREE.Vector3()).length();
        const boxCenter = boundingBox.getCenter(new THREE.Vector3());

        // Setting the Camera distance based on the calculated box size.
        setCameraDistance(boxSize * 1.2, boxSize, boxCenter, camera);

        // Light
        const light = new THREE.DirectionalLight(0xffffff, 3);
        light.position.set(-1, 2, 4);
        camera.add(light);

        scene.userData.element = sceneContainerRef.current;
        scene.userData.camera = camera;
        scene.background = new THREE.Color(0x909090)

        // This function will be called per frame
        const renderFun = (renderer, time, rect) => {
            model.rotation.y = time * .001;
            camera.aspect = rect.width / rect.height;
            camera.updateProjectionMatrix();
            renderer.render(scene, camera);
        }

        function setCameraDistance(sizeToFitOnScreen, boxSize, boxCenter, camera) {

            // Calculating the distance of camera from the object as per its
            // bounding box by using (tanΘ = perp / base)
            const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
            const halfFovY = THREE.MathUtils.degToRad(camera.fov * .5);
            let distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
            
            // compute a unit vector that points in the direction the camera is now
            // from the center of the box
            const direction = (new THREE.Vector3()).subVectors(camera.position, boxCenter).normalize();

            // Ovverriding the distance for testing purpose.
            distance = halfSizeToFitOnScreen * 2;

            // move the camera to a position distance units way from the center
            // in whatever direction the camera was from the center already
            camera.position.set(0, 0, distance);

            camera.updateProjectionMatrix();

            // point the camera to look at the center of the box
            camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);

        }

        scenesRef?.current.push({ scene, renderFun });

    }, [model]);



    return (
        <>
            <div ref={sceneContainerRef} className="scene-container">

            </div>
        </>
    )
}

export default ProductContainer