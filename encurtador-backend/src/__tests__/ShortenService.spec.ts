import { toDataURL } from "qrcode"
import { prisma } from "../prisma/client"
import { shortenService } from "../Services/ShortenService"
import QrCode from "qrcode"

jest.mock('nanoid', () => {
    return {
        customAlphabet: jest.fn().mockReturnValue(() => 'ABCDE')
    }
})

jest.mock("../prisma/client", () => {
    return {
        prisma: {
            link: {
                create: jest.fn(),
                findUnique: jest.fn()
            }
        }
    }
})

jest.mock('qrcode', () => {
    return {
        toDataURL: jest.fn()
    }
})

describe("Shorten Service Test", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    })

    it("Deve registar receber uma URL e retornar um shortId", async () => {
        const resultado = await shortenService.register({ url: "www.teste.com/essa-url-e-longa", shortId: null });

        expect(resultado).toHaveProperty('shortId');
        expect(resultado.shortId).toHaveLength(5);
        expect(resultado).toEqual({ shortId: 'ABCDE' })
        expect(prisma.link.create).toHaveBeenCalledTimes(1);
        expect(prisma.link.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                originalUrl: "www.teste.com/essa-url-e-longa",
                shortId: expect.any(String)
            })
        }))
    })

    it("Deve registar receber uma URL e retornar um shortId", async () => {
        const resultado = await shortenService.register({ url: "www.teste.com/essa-url-e-longa", shortId: "teste" });

        expect(resultado).toHaveProperty('shortId');
        expect(resultado).toEqual({ shortId: 'teste' })
        expect(prisma.link.create).toHaveBeenCalledTimes(1);
        expect(prisma.link.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                originalUrl: "www.teste.com/essa-url-e-longa",
                shortId: expect.any(String)
            })
        }))
    })

    it("Deve buscar um link pelo shortId existente", async () => {
        (prisma.link.findUnique as jest.Mock).mockResolvedValue({
            shortId: 'teste',
            originalUrl: 'www.teste.com.br/teste/teste2/teste3'
        });

        const result = await shortenService.findByIdentifier('teste');

        expect(result).toEqual({ originalUrl: 'www.teste.com.br/teste/teste2/teste3' })
        expect(prisma.link.findUnique).toHaveBeenCalledTimes(1);
        expect(prisma.link.findUnique).toHaveBeenCalledWith({ where: { shortId: 'teste' } });


    })

    it("Deve buscar o link por um shortId inexistente", async () => {
        const mockShortId = 'teste';

        (prisma.link.findUnique as jest.Mock).mockResolvedValue(null);

        await expect(shortenService.findByIdentifier(mockShortId))
            .rejects
            .toThrow('Not found...')
    })

    it("Deve gerar um base64 de um link informado", async () => {
        const mockUrl = "https://exemplo.teste.com"
        const mockBase64 = "data:image/png;base64,exemplo";


        (QrCode.toDataURL as jest.Mock).mockResolvedValue(mockBase64)

        const result = await shortenService.generateQrCode({ url: mockUrl })

        expect(result).toEqual({ base64: mockBase64 })
        expect(QrCode.toDataURL).toHaveBeenCalledTimes(1)
        expect(QrCode.toDataURL).toHaveBeenCalledWith(mockUrl)

    })

    it("Deve verificar se o shortId passado já existe", async () =>{
        const mockShortId = "https://exemplo.teste.com"


        await expect(shortenService.findByIdentifier(mockShortId))
            .rejects
            .toThrow('Not found...')
    })
})