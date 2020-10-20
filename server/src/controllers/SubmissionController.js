import Entities from 'html-entities';
import fs from "fs";
import SubmissionModel from '../models/SubmissionModel.js';
import { stepOneValidation, stepTwoValidation, stepThreeValidation, setImageValidation, setStatusValidation } from '../validators/submissionValidation.js';

const entities = new Entities.AllHtmlEntities();

class SubmissionController {

    static async delete(req, res){
        let submissionID = req.body.submissionID;
        if(!submissionID) return res.status(400).send("submissionID not valid");

        let sub = await SubmissionModel.get(submissionID);
        if(!sub) return res.status(400).send('Submission not found');
        await sub.delete();
        return res.send('Submission Deleted.');
    }

    static async getMine(req, res) {
        let submitterID = req.userID;
        if(!submitterID) return res.status(400).send("SubmitterID not valid");

        let subs = await SubmissionModel.find({submitterID: submitterID});
        return res.send({submissions: subs});
    }

    static async getInfo(req, res) {
        let submissionID = req.body.submissionID;
        if(!submissionID) return res.status(400).send("submissionID not valid");

        let sub = await SubmissionModel.get(submissionID);
        if(!sub) return res.status(400).send('Submission not found');
        return res.send(sub);
    }

    static async stepOne(req, res){
        req.body.submitterID = req.userID;
        let {error} = stepOneValidation(req.body);
        if(error) return res.status(400).send(error.details[0].message);

        let name = entities.encodeNonUTF(req.body.name);
        let sub;
        if(req.body.submissionID !== undefined && req.body.submissionID !== null && req.body.submissionID !== ''){
            sub = await SubmissionModel.setInfo(req.body.submissionID, {
                name: name,
                hasBox: req.body.hasBox,
                type: SubmissionModel.convertTypeTextToNumber(req.body.type)
            });
            if(sub.nModified === 0) return res.status(400).send("Something went wrong.");
            sub = await SubmissionModel.get(req.body.submissionID);
        }else{
            sub = await SubmissionModel.create(name,
                req.body.hasBox, req.body.type, req.body.submitterID);
            if(!sub) return res.status(400).send("Something went wrong.");
        }
        if(sub.type === -1){
            await SubmissionModel.delete(sub._id);
            return res.status(400).send("Wrong Submission Type.");
        }
        return res.send(sub._id);
    }

    static async stepTwo(req, res) {
        let {error} = stepTwoValidation(req.body);
        if(error) return res.status(400).send(error.details[0].message);
        
        let description = entities.encodeNonUTF(req.body.description);

        let sub = await SubmissionModel.setDescription(req.body.submissionID, description);
        if(!sub) return res.status(400).send("Something went wrong");
        return res.send(sub._id);
    }

    static async stepThree(req, res){
        let {error} = stepThreeValidation(req.body);
        if(error) return res.status(400).send(error.details[0].message);

        if(req.body.artist2D) req.body.artist2D = entities.encodeNonUTF(req.body.artist2D);
        if(req.body.artist3D) req.body.artist3D = entities.encodeNonUTF(req.body.artist3D);
        if(req.body.height) req.body.height = entities.encodeNonUTF(req.body.height);
        if(req.body.gradientFrom) req.body.gradientFrom = entities.encodeNonUTF(req.body.gradientFrom);
        if(req.body.gradientTo) req.body.gradientTo = entities.encodeNonUTF(req.body.gradientTo);

        let sub = await SubmissionModel.setInfo(req.body.submissionID, {
            categoryID: req.body.categoryID,
            priceID: req.body.priceID,
            height: req.body.height,
            artist2D: req.body.artist2D,
            artist3D: req.body.artist3D,
            gradientFrom: req.body.gradientFrom,
            gradientTo: req.body.gradientTo
        });
        if(!sub) return res.status(400).send("Something went wrong");
        return res.send(sub);
    }

    static async setStatus(req, res){
        let {error} = setStatusValidation(req.body);
        if(error) return res.status(400).send(error.details[0].message);
        
        if(req.body.status) req.body.status = entities.encodeNonUTF(req.body.status);
        if(req.body.statusMessage) req.body.statusMessage = entities.encodeNonUTF(req.body.statusMessage);
        
        let sub = await SubmissionModel.setInfo(req.body.submissionID, {
            status: req.body.status,
            statusMessage: req.body.statusMessage
        });
        if(!sub) return res.status(400).send("Something went wrong");
        return res.send(sub);
    }

    static async setImage(req, res) {
        let {error} = setImageValidation(req.body);
        if(error) return res.status(400).send(error.details[0].message);

        let tempPath = req.file.path;
        let originalName = String(req.file.originalname);
        let extension = originalName.split('.');
        extension = extension[extension.length -1];
        if(String(extension).toLowerCase() !== "png"){
            fs.unlinkSync('./' + tempPath);
            return res.status(400).send("Wrong Image Format. Only PNGs Allowed.");
        }
        let fullPath = "/" + tempPath + '.' + extension;
        try{
            fs.rename(tempPath, '.' + fullPath, (err) => console.log(err));
        }catch(err) {
            res.status(400).send(err);
            return;
        }

        let sub = await SubmissionModel.get(req.body.submissionID);
        switch(req.body.imageType){
            case "2D":
                if(sub.image2D !== null && sub.image2D !== undefined){
                    fs.unlinkSync('.' + sub.image2D);
                }
                sub.image2D = fullPath;
                break;
            case "3D":
                if(sub.image3D !== null && sub.image3D !== undefined){
                    fs.unlinkSync('.' + sub.image3D);
                }
                sub.image3D = fullPath;
                break;
            case "Box":
                if(sub.imageBox !== null && sub.imageBox !== undefined){
                    fs.unlinkSync('.' + sub.imageBox);
                }
                sub.imageBox = fullPath;
                break;
            default:
                fs.unlinkSync('.' + fullPath);
                return res.status(400).send("Wrong Image Type");
        }
        try{
            await sub.save();
        }catch(err){
            return res.status(400).send(err);
        }
        res.send(fullPath);
    }

}

export default SubmissionController;