/*
 * Copyright 2021 WPPConnect Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import styled from "styled-components";


export const ModalContainer = styled.div`
  background: #E9E9E9;
  border-radius: 40px;
  display: flex;
  flex-direction: column;
  color: #000;
  margin: 0 auto;
  position: relative;

  @media (max-width: 768px) {
    margin-top: 3em;
  }

  .middle-section {
    display: flex;
    flex-direction: column;
    padding: 1em 2em;
    text-align: center;

    h2 {
      font-weight: 600;
      margin-bottom: 10px;
      font-size: 2rem;
    }

    p {
      margin-top: 10px;
      font-weight: 400;
      font-size: 1.5rem;
    }

    a {
      color: #000;
      margin-top: 10px;
      cursor: pointer;
    }
  }

  .bottom-section {
    border-top: 1px solid rgba(0, 0, 0, .1);
    display: flex;
    align-items: center;
    justify-content: center;
    
    a {
      width: 50%;
      border: 0;
      border-radius: 0 0 20px 0;
      text-decoration: none;
      color: #7482A2;
      font-weight: 500;
      text-transform: uppercase;
      padding: 1em 0;
      cursor: pointer;
      font-size: 13px;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #EFEFEF;
      border-left: 1px solid rgba(0, 0, 0, .1);
      outline: 0;
      
      svg {
        width: 15px;
        height: 15px;
      }
    }

    button {
      width: 50%;
      border: 0;
      border-radius: 0 0 0 20px;
      text-decoration: none;
      color: rgba(210, 32, 32);
      font-weight: 500;
      text-transform: uppercase;
      background: #EFEFEF;
      padding: 1em 0;
      outline: 0;
      cursor: pointer;
    }
  }
`;

export const ImageCustom = styled.img`
  width: 300px;
  object-fit: cover;
  margin: 0 auto;
`;

export const Title = styled.h1`
  font-size: 3rem;
  font-weight: 500;
  color: #444;
`;


export const Layout = styled.div`
  height: 100%;
  width: 100%;

  display: flex;
  overflow: hidden;

  justify-content: center;
  align-items: center;
  position: relative;

  .close-item {
    position: absolute;
    top: 2em;
    right: 2em;

    cursor: pointer;
  }
`;

export const Container = styled.div`
  height: 100%;
  width: 100%;

  display: flex;
  flex-direction: column;

  justify-content: center;
  align-items: center;

  .container-session {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    #left-div {
      width: 60%;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #F8F8F8;

      img {
        width: 500px;
        height: 500px;
        object-fit: contain;
      }
    }

    #right-div {
      width: 40%;
      height: 100vh;
      display: flex;
      justify-content: center;
      flex-direction: column;
      padding: 2em;
    }
  }
`;