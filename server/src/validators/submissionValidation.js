import Joi from '@hapi/joi';


export const stepOneValidation = (requestBody) => {
    const schema = Joi.object({
        submitterID: Joi.string().min(6).required(),
        type: Joi.string().required(),
        hasBox: Joi.boolean().required(),
        name: Joi.string().required()
    });

    return schema.validate(requestBody);
}

export const stepTwoValidation = (requestBody) => {
    const schema = Joi.object({
        submissionID: Joi.string().required(),
        description: Joi.string().required()
    });

    return schema.validate(requestBody);
}

export const stepThreeValidation = (requestBody) => {
    const schema = Joi.object({
        submissionID: Joi.string().required(),
        categoryID: Joi.string().required(),
        priceID: Joi.string().required(),
        height: Joi.string().required(),
        artist2D: Joi.string(),
        artist3D: Joi.string()
    });

    return schema.validate(requestBody);
}

export const setImageValidation = (requestBody) => {
    const schema = Joi.object({
        submissionID: Joi.string().required(),
        imageType: Joi.string().required(),
    });

    return schema.validate(requestBody);
}