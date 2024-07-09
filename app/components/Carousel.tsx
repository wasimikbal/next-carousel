'use client'
import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

import ProductContainer from './ProductContainer';

const Carousel = () => {

    /**
      * The ref to store an array of scenesData objects.
      * 
      * @property {THREE.Scene} scene - The THREE.js scene.
      * @property {HTMLDivElement} divElement - The container div element where the scene is rendered.
      * @property {Function} renderFun - The function to render the scene.
      */
    const scenesDataRef = useRef<{
        scene: THREE.Scene, divElement: HTMLDivElement
        renderFun: (renderer: THREE.WebGLRenderer, time, rect) => void
    }[]>([]);

    /**
      * To store the canvas reference.
      * 
      * @property {HTMLCanvasElemente} scene - The Canvas element
      */
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    /**
      * To store the the carousel's content div reference.
      * 
      * @property {HTMLCanvasElemente} scene - The Canvas element
      */
    const contentRef = useRef<HTMLDivElement | null>(null);

    // Array to represent the number of products
    const productsPlaceholder = [1, 2, 3];



    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Renderer init
        const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
        renderer.setClearColor(0xffffff, 1);
        renderer.setPixelRatio(window.devicePixelRatio);

        // Function to set the size of renderer if the canvas is resized.
        function resizeRendererToDisplaySize(renderer) {
            // Setting the size of the renderer as per canvas dimensions.
            const canvas = renderer.domElement;
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            const needResize = canvas.width !== width || canvas.height !== height;
            if (needResize) {
                renderer.setSize(width, height, false);
            }
            return needResize;
        }

        // Animate Loop
        const animate = (time) => {
            for (const { scene, divElement,renderFun } of scenesDataRef.current) {
                resizeRendererToDisplaySize(renderer);

                // renderer.setScissorTest(false);
                // renderer.setClearColor('#000', 0);
                // renderer.clear(true, true);
                renderer.setScissorTest(true);

                // const transform = `translateY(${window.scrollY}px)`;
                // renderer.domElement.style.transform = transform;
                
                // Calculating rect as per the divElement dimensions.
                const element = scene.userData.element;
                const rect = element.getBoundingClientRect();

                const { left, right, top, bottom, width, height } = rect;

                const isOffscreen =
                bottom < 0 ||
                top > renderer.domElement.clientHeight ||
                right < 0 ||
                left > renderer.domElement.clientWidth;
                
                // Check if the divElement is out of canvas bounds.
                if (!isOffscreen) {

                    const positiveYUpBottom = renderer.domElement.clientHeight - bottom;
                    renderer.setScissor(left, positiveYUpBottom, width, height);
                    renderer.setViewport(left, positiveYUpBottom, width, height);

                    renderFun(renderer, time, rect);
                }
            }

            resizeRendererToDisplaySize(renderer);
            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);




    }, []);


    return (
        <>
            <canvas id="canvas" ref={canvasRef}></canvas>
            <div id="content" ref={contentRef}>
                {productsPlaceholder.map((product, ndx) => (
                    <ProductContainer key={ndx} scenesRef={scenesDataRef} />
                ))}
            </div>
        </>
    )
}

export default Carousel