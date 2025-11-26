import { GetMagnetStatusDto } from './get-magnet-status.dto';
import { validate } from 'class-validator';

describe('GetMagnetStatusDto', () => {
  it('should be defined', () => {
    expect(new GetMagnetStatusDto()).toBeDefined();
  });

  it('should validate with a valid magnetId', async () => {
    const dto = new GetMagnetStatusDto();
    dto.magnetId = '12345';
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should not validate without a magnetId', async () => {
    const dto = new GetMagnetStatusDto();
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toEqual('magnetId');
    expect(errors[0].constraints).toHaveProperty('isString');
  });
});
