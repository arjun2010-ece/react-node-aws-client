import dynamic from "next/dynamic";
import { useState, useEffect } from 'react';
import axios from 'axios';
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import Resizer from 'react-image-file-resizer';
import { API } from '../../../config';
import { showSuccessMessage, showErrorMessage } from '../../../helpers/alerts';
import Layout from '../../../components/Layout';
import withAdmin from '../../withAdmin';
import "react-quill/dist/quill.bubble.css";

const Create = ({ user, token }) => {
    const [state, setState] = useState({
        name: '',
        error: '',
        success: '',
        buttonText: 'Create',
        image: ''
    });
    const [imageUploadButtonName, setImageUploadButtonName] = useState('Upload image');
    const [content, setContent] = useState('');

    const { name, success, error, image, buttonText } = state;

    const handleContent = e => {
        // console.log("EVENT::", e);
        setContent(e);
        setState({ ...state, error: '', success: '' });
    };

    const handleChange = name => e => {
        setState({ ...state, [name]: e.target.value, error: '', success: '' });
    };

    const handleImage = event => {
        let fileInput = false;
        if (event.target.files[0]) {
            fileInput = true;
        }
        setImageUploadButtonName(event.target.files[0].name);
        if (fileInput) {
            Resizer.imageFileResizer(
                event.target.files[0],
                300,
                300,
                'JPEG',
                100,
                0,
                uri => {
                    // console.log(uri);
                    setState({ ...state, image: uri, success: '', error: '' });
                },
                'base64'
            );
        }
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setState({ ...state, buttonText: 'Creating' });
        // console.table({ name, content, image });
        try {
            const response = await axios.post(
                `${API}/category`,
                { name, content, image },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            console.log('CATEGORY CREATE RESPONSE', response);
            setImageUploadButtonName('Upload image');
            // here we have put setContent before bcoz once setcontent runs then its value appears on screen
            // and after that setstate runs and its value appears on screen.
            // thats why we shd put that setState last whose value we want to appear on screen.
            setContent("");
            setState({
                ...state,
                name: '',
                content: '',
                buttonText: 'Created',
                success: `${response.data.name} is created`
            });
        } catch (err) {
            console.log('CATEGORY CREATE ERROR', err.response.data.error);
            setState({ ...state, buttonText: 'Create', error: err.response.data.error });
        }
    };

    const createCategoryForm = () => (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label className="text-muted">Name</label>
                <input onChange={handleChange('name')} value={name} type="text" className="form-control" />
            </div>
            <div className="form-group">
                <label className="text-muted">Content</label>
                <ReactQuill 
                    theme="bubble"
                    value={content} 
                    onChange={handleContent} 
                    placeholder="Write Something.."
                    className="pb-5 mb-3"
                    style={{ border: "1px solid #666"}} 
                />
            </div>
            <div className="form-group">
                <label className="btn btn-outline-secondary">
                    {imageUploadButtonName}
                    <input onChange={handleImage} type="file" accept="image/*" className="form-control" hidden />
                </label>
            </div>
            <div>
                <button className="btn btn-outline-warning">{buttonText}</button>
            </div>
        </form>
    );

    return (
        <Layout>
            <div className="row">
                <div className="col-md-6 offset-md-3">
                    <h1>Create category</h1>
                    <br />
                    {success && showSuccessMessage(success)}
                    {error && showErrorMessage(error)}
                    {createCategoryForm()}
                </div>
            </div>
        </Layout>
    );
};

export default withAdmin(Create);
