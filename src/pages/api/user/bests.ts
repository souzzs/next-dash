import { NextApiHandler } from "next";
import { unstable_getServerSession } from "next-auth";
import { getBests } from "../../../lib/user/getBests";
import { authOptions } from "../auth/[...nextauth]";

const handlerGet: NextApiHandler = async (req, res) => {
    const session = await unstable_getServerSession(req, res, authOptions);

    if(!session){
        return res.status(401).json({
            message: "Você não tem permissão para acessar esses dados."
        });
    }

    try {
        const bests = await getBests();

        return res.status(200).json({
            data: {...bests}
        });
    } catch (e) {
        return res.status(401).json({
            message: e
        })
    }
}

const handler: NextApiHandler = async (req, res) => {
    const { method } = req;
    
    switch (method) {
        case 'GET': 
            handlerGet(req, res);
            break;
        default:
            return res.status(404).json({message: 'Route not found.'})
    }
}

export default handler